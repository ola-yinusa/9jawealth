/**
 * Shared assessment validation + scoring.
 *
 * Browser-safe: no Node-only imports so it can be used by both the
 * React frontend and the `/api/send-report` serverless function.
 * The server recomputes the result from `answers` and ignores any
 * client-supplied bracket/summary/recommendation.
 */

export interface QuizResult {
  bracket: string;
  summary: string;
  recommendation: string;
}

export interface ValidSubmission {
  name: string;
  email: string;
  answers: Record<string, string>;
  submittedAt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_ANSWER_VALUE_LENGTH = 60;
const MIN_STANDARD_ANSWERS = 26;

const RESULTS: QuizResult[] = [
  {
    bracket: "Good shape",
    summary:
      "You already show strong financial awareness and structure in several core areas.",
    recommendation:
      "Your next gain is likely in sharpening your strategy, not starting from scratch.",
  },
  {
    bracket: "On the right track",
    summary:
      "There is a meaningful base here, but a few habits and planning gaps are limiting momentum.",
    recommendation:
      "A clearer system and more disciplined follow-through could materially change your trajectory.",
  },
  {
    bracket: "Weak pulse",
    summary:
      "You are carrying enough uncertainty that your financial progress may feel slower or less stable than it should.",
    recommendation:
      "The highest-value next step is clarity: know where you stand, what matters most, and what to fix first.",
  },
  {
    bracket: "Needs attention",
    summary:
      "Several foundational systems appear underdeveloped, which means opportunity may be getting lost before it compounds.",
    recommendation:
      "A guided reset around awareness, discipline, and planning would likely create the biggest improvement.",
  },
];

/** Escape user-controlled text before interpolating into HTML email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isValidEmail(value: string): boolean {
  return value.length >= 5 && value.length <= 254 && EMAIL_RE.test(value);
}

export function normalizeName(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/** Mask an email for non-PII-safe stores (e.g. `a***@example.com`). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const head = local.slice(0, 1) || "*";
  return `${head}***@${domain}`;
}

/**
 * Server-authoritative scoring. Counts every standard question (id <= 26)
 * answered "NO" or "I DON'T KNOW" as a gap. Custom section-D answers do
 * not affect the bracket. Accepts string or numeric keys.
 */
export function computeQuizResult(
  answers: Record<string | number, unknown>,
): QuizResult {
  let score = 0;
  for (const [rawId, value] of Object.entries(answers)) {
    const questionId = Number.parseInt(rawId, 10);
    if (
      Number.isInteger(questionId) &&
      questionId >= 1 &&
      questionId <= 26 &&
      (value === "NO" || value === "I DON'T KNOW")
    ) {
      score += 1;
    }
  }
  if (score <= 4) return RESULTS[0];
  if (score <= 10) return RESULTS[1];
  if (score <= 12) return RESULTS[2];
  return RESULTS[3];
}

export function countStandardAnswers(
  answers: Record<string, unknown>,
): number {
  return Object.keys(answers).filter((key) => {
    const id = Number.parseInt(key, 10);
    return Number.isInteger(id) && id >= 1 && id <= 26;
  }).length;
}

export interface ValidationOutcome {
  ok: boolean;
  errors: string[];
  value: ValidSubmission | null;
}

/** Strict runtime validation for untrusted submission JSON. */
export function validateSubmission(payload: unknown): ValidationOutcome {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Invalid submission payload"], value: null };
  }
  const body = payload as Record<string, unknown>;

  const name = normalizeName(body.name);
  if (name.length < 2) errors.push("Please provide your full name");
  if (name.length > 80) errors.push("Name must be 80 characters or fewer");

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) errors.push("Please provide a valid email address");

  const rawAnswers = body.answers;
  let answers: Record<string, string> | null = null;
  if (!rawAnswers || typeof rawAnswers !== "object" || Array.isArray(rawAnswers)) {
    errors.push("Assessment answers are missing");
  } else {
    answers = {};
    for (const [key, value] of Object.entries(rawAnswers as Record<string, unknown>)) {
      const id = Number.parseInt(key, 10);
      if (!Number.isInteger(id) || id < 1 || id > 31) {
        errors.push(`Unknown question id: ${key}`);
        continue;
      }
      if (typeof value !== "string" || value.length === 0) {
        errors.push(`Missing answer for question ${key}`);
        continue;
      }
      if (value.length > MAX_ANSWER_VALUE_LENGTH) {
        errors.push(`Answer for question ${key} is too long`);
        continue;
      }
      answers[key] = value;
    }
    if (answers && countStandardAnswers(answers) < MIN_STANDARD_ANSWERS) {
      errors.push("Please complete all assessment questions before submitting");
    }
  }

  let submittedAt = new Date().toISOString();
  if (typeof body.submittedAt === "string" && body.submittedAt) {
    const parsed = new Date(body.submittedAt);
    const now = Date.now();
    // Accept client timestamps within a sane window; otherwise use server time.
    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getTime() <= now + 5 * 60 * 1000 &&
      parsed.getTime() >= now - 24 * 60 * 60 * 1000
    ) {
      submittedAt = parsed.toISOString();
    }
  }

  if (errors.length > 0 || !answers) {
    return { ok: false, errors, value: null };
  }
  return { ok: true, errors: [], value: { name, email, answers, submittedAt } };
}

import {
  quizQuestions,
  quizSectionLabels,
  standardOptions,
  type QuizQuestion,
  type QuizSection,
  type StandardAnswer,
} from "../content/quiz.js";

export type Answer = StandardAnswer | string;

export interface QuizResult {
  bracket: string;
  summary: string;
  recommendation: string;
}

export interface SectionScore {
  section: "A" | "B" | "C" | "D";
  label: string;
  answered: number;
  total: number;
  gaps: number;
}

export interface QuizBreakdown {
  totalScore: number;
  sections: SectionScore[];
  focusGoal: string;
  incomeSource: string;
  recommendedPath: {
    id: "signature" | "palmville" | "consultation";
    title: string;
    reason: string;
    href: string;
    guideHref: string;
  };
}

const SECTION_ORDER: QuizSection[] = ["A", "B", "C", "D"];
const STANDARD_ANSWER_SET = new Set<string>(standardOptions);

const QUIZ_RESULTS: QuizResult[] = [
  {
    bracket: "Good shape",
    summary: "You already show strong financial awareness and structure in several core areas.",
    recommendation: "Your next gain is likely in sharpening your strategy, not starting from scratch.",
  },
  {
    bracket: "On the right track",
    summary: "There is a meaningful base here, but a few habits and planning gaps are limiting momentum.",
    recommendation: "A clearer system and more disciplined follow-through could materially change your trajectory.",
  },
  {
    bracket: "Weak pulse",
    summary: "You are carrying enough uncertainty that your financial progress may feel slower or less stable than it should.",
    recommendation: "The highest-value next step is clarity: know where you stand, what matters most, and what to fix first.",
  },
  {
    bracket: "Needs attention",
    summary: "Several foundational systems appear underdeveloped, which means opportunity may be getting lost before it compounds.",
    recommendation: "A guided reset around awareness, discipline, and planning would likely create the biggest improvement.",
  },
];

function readAnswer(answers: Record<number | string, unknown>, id: number): string {
  const raw = answers[id] ?? answers[String(id)];
  return typeof raw === "string" ? raw.trim() : "";
}

function resolveRecommendedPath(focusGoal: string): QuizBreakdown["recommendedPath"] {
  const normalized = focusGoal.toLowerCase();

  // Check agro/palm before "real estate" because "Agro-real estate" contains "real estate".
  if (normalized.includes("agro") || normalized.includes("palm")) {
    return {
      id: "palmville",
      title: "PalmVille Agro Real Estate",
      reason:
        "You selected agro-real estate for the next 30 days. PalmVille combines titled land in Ogun State with managed oil-palm harvests.",
      href: "https://palmville.9jawealth.com/",
      guideHref: "/education#featured-offerings",
    };
  }

  if (normalized.includes("real estate") || normalized.includes("land")) {
    return {
      id: "signature",
      title: "Lekki Avana Signature",
      reason:
        "You selected real estate for the next 30 days. Compare Gazette-backed plots and 6- to 12-month payment plans in Ibeju-Lekki.",
      href: "https://signature.9jawealth.com/",
      guideHref: "/education#featured-offerings",
    };
  }

  return {
    id: "consultation",
    title: "1-on-1 Financial Clarity Consultation",
    reason:
      "A 30-minute session with Olanrewaju will help you turn your assessment results into a practical savings, protection, and property plan.",
    href: "/education#book",
    guideHref: "/education#book",
  };
}

export function getChoiceSet(question: QuizQuestion): string[] {
  return question.type === "standard" ? [...standardOptions] : question.options ?? [];
}

/**
 * Derive per-section progress/gaps, Q27/Q31 context, and matched next-step path
 * directly from the canonical quiz definition.
 */
export function getQuizBreakdown(answers: Record<number | string, unknown>): QuizBreakdown {
  const sectionMap = new Map<QuizSection, SectionScore>(
    SECTION_ORDER.map((section) => [
      section,
      {
        section,
        label: quizSectionLabels[section],
        answered: 0,
        total: 0,
        gaps: 0,
      },
    ]),
  );

  for (const question of quizQuestions) {
    const entry = sectionMap.get(question.section)!;
    entry.total += 1;

    const value = readAnswer(answers, question.id);
    if (question.type === "standard") {
      if (STANDARD_ANSWER_SET.has(value)) {
        entry.answered += 1;
        if (value === "NO" || value === "I DON'T KNOW") {
          entry.gaps += 1;
        }
      }
    } else if (value.length > 0) {
      entry.answered += 1;
    }
  }

  const sections = SECTION_ORDER.map((section) => sectionMap.get(section)!);
  const totalScore = sections.reduce((sum, item) => sum + item.gaps, 0);
  const focusGoal = readAnswer(answers, 31);
  const incomeSource = readAnswer(answers, 27);

  return {
    totalScore,
    sections,
    focusGoal,
    incomeSource,
    recommendedPath: resolveRecommendedPath(focusGoal),
  };
}

/** Return the lowest-numbered unanswered (or invalid standard) question ID, or null when complete. */
export function getFirstMissingQuestionId(answers: Record<number | string, unknown>): number | null {
  for (const question of quizQuestions) {
    const value = readAnswer(answers, question.id);
    if (question.type === "standard") {
      if (!STANDARD_ANSWER_SET.has(value)) return question.id;
    } else if (value.length === 0) {
      return question.id;
    }
  }
  return null;
}

/** Compute balanced bracket copy across 0-26 standard gap points (Q1-Q26). */
export function getQuizResult(answers: Record<number | string, unknown>): QuizResult {
  const { totalScore } = getQuizBreakdown(answers);

  if (totalScore <= 4) return { ...QUIZ_RESULTS[0] };
  if (totalScore <= 10) return { ...QUIZ_RESULTS[1] };
  if (totalScore <= 17) return { ...QUIZ_RESULTS[2] };
  return { ...QUIZ_RESULTS[3] };
}

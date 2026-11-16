import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMailConfig, sendMail } from "../src/lib/mailer.js";
import { createLarkLeadRecord, type LeadRecordInput } from "../src/lib/lark-base.js";
import { put } from "@vercel/blob";
import {
  computeQuizResult,
  escapeHtml,
  getQuizBreakdown,
  isValidEmail,
  maskEmail,
  normalizeName,
  validateSubmission,
  type QuizBreakdown,
  type QuizResult,
} from "../src/lib/assessment.js";
import { buildLeadNotification } from "../src/lib/lead-notification.js";

/* ------------------------------------------------------------------ */
/*  Rate limiting (per-instance, best-effort)                           */
/*                                                                     */
/*  Serverless instances do not share memory, so this is a first line  */
/*  of defence only. For stronger protection front the endpoint with   */
/*  Vercel Firewall / KV-backed limits + Turnstile (see handoff doc).  */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

const FALLBACK_OWNER_EMAIL = "ola.yinusa.lanre@gmail.com";

export interface SendReportDependencies {
  sendMail: typeof sendMail;
  getMailConfig: typeof getMailConfig;
  createLarkLeadRecord: typeof createLarkLeadRecord;
  putBlob: typeof put;
}

const defaultDeps: SendReportDependencies = {
  sendMail,
  getMailConfig,
  createLarkLeadRecord,
  putBlob: put,
};

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    return { limited: true, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfter: 0 };
}

// Exported for tests.
export function __resetRateLimits() {
  rateBuckets.clear();
}

/* ------------------------------------------------------------------ */
/*  CORS allowlist (same-origin + owner domains + Vercel previews)     */
/* ------------------------------------------------------------------ */

const PRODUCTION_ORIGINS = [
  "https://www.9jawealth.com",
  "https://9jawealth.com",
  "https://signature.9jawealth.com",
  "https://palmville.9jawealth.com",
];

const VERCEL_PREVIEW_ORIGIN_RE = /^https:\/\/9jawealth(-[a-z0-9-]+)?\.vercel\.app$/;

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => Boolean(s) && s !== "*");
  return Array.from(new Set([...PRODUCTION_ORIGINS, ...fromEnv]));
}

function isAllowedOrigin(origin: string): boolean {
  return getAllowedOrigins().includes(origin) || VERCEL_PREVIEW_ORIGIN_RE.test(origin);
}

function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (!origin) return true; // same-origin / non-browser request
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: "Origin not allowed" });
    return false;
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase()).digest("hex");
}

async function tryCreateLarkLead(
  input: LeadRecordInput,
  createRecord: typeof createLarkLeadRecord = createLarkLeadRecord,
): Promise<{ ok: boolean; recordId: string | null }> {
  try {
    const recordId = await createRecord(input);
    return { ok: true, recordId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Lark error";
    console.error("[send-report] Lark lead capture failed", input.reference, message);
    return { ok: false, recordId: null };
  }
}

export async function captureLeadInLark(input: LeadRecordInput): Promise<boolean> {
  const outcome = await tryCreateLarkLead(input);
  return outcome.ok;
}

async function sendOwnerNotificationWithFallback(
  input: {
    subject: string;
    html: string;
    text: string;
    replyTo: string;
  },
  deps: SendReportDependencies = defaultDeps,
): Promise<void> {
  const mailConfig = deps.getMailConfig();
  const recipients = Array.from(
    new Set(
      [mailConfig.notifyTo, FALLBACK_OWNER_EMAIL]
        .map((r) => r.trim())
        .filter(Boolean),
    ),
  );
  let deliveredCount = 0;
  let lastError: unknown = null;
  for (const recipient of recipients) {
    try {
      await deps.sendMail({
        to: recipient,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      });
      deliveredCount += 1;
    } catch (err) {
      lastError = err;
      console.error("[send-report] Notification to", recipient, "failed:", err);
    }
  }
  if (deliveredCount === 0 && lastError) {
    throw lastError;
  }
}

const SITE_BASE_URL = "https://www.9jawealth.com";
const MIN_DWELL_MS = 2_000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1_000;
const MAX_PAST_SUBMITTED_MS = 24 * 60 * 60 * 1_000;

function resolveEmailUrl(href: string): string {
  return href.startsWith("/") ? `${SITE_BASE_URL}${href}` : href;
}

function formatSectionBreakdownSummary(breakdown: QuizBreakdown): string {
  const sectionParts = breakdown.sections.map((section) =>
    section.section === "D"
      ? `${section.label}: ${section.answered}/${section.total} answered`
      : `${section.label}: ${section.gaps}/${section.total} gaps`,
  );
  return `${sectionParts.join(" · ")} (Total gaps: ${breakdown.totalScore}/26)`;
}

function buildRichLeadResult(result: QuizResult, breakdown: QuizBreakdown): QuizResult {
  const pathUrl = resolveEmailUrl(breakdown.recommendedPath.href);
  return {
    bracket: result.bracket,
    summary: `${result.summary} | ${formatSectionBreakdownSummary(breakdown)}`,
    recommendation: [
      result.recommendation,
      `30-day direction (Q31): ${breakdown.focusGoal || "Not specified"}`,
      `Primary income (Q27): ${breakdown.incomeSource || "Not specified"}`,
      `Matched path: ${breakdown.recommendedPath.title} (${pathUrl})`,
    ].join(" | "),
  };
}

function isSubmissionTooFast(body: Record<string, unknown>, now = Date.now()): boolean {
  if (typeof body.startedAt !== "string" || !body.startedAt) return false;
  const started = Date.parse(body.startedAt);
  if (Number.isNaN(started)) return false;

  const submitted =
    typeof body.submittedAt === "string" && body.submittedAt ? Date.parse(body.submittedAt) : Number.NaN;
  const hasValidSubmitted =
    !Number.isNaN(submitted) &&
    submitted <= now + MAX_CLOCK_SKEW_MS &&
    submitted >= now - MAX_PAST_SUBMITTED_MS;

  if (hasValidSubmitted) {
    return submitted - started < MIN_DWELL_MS;
  }

  const serverElapsed = now - started;
  // Tolerate browser clocks up to 5 minutes ahead of server time before flagging as scripted.
  if (serverElapsed < 0 && serverElapsed >= -MAX_CLOCK_SKEW_MS) {
    return false;
  }
  return serverElapsed < MIN_DWELL_MS;
}

function buildEmailHtml(
  name: string,
  result: QuizResult,
  reference: string,
  breakdown: QuizBreakdown,
): string {
  const safeName = escapeHtml(name);
  const safeBracket = escapeHtml(result.bracket);
  const safeSummary = escapeHtml(result.summary);
  const safeRecommendation = escapeHtml(result.recommendation);
  const safeReference = escapeHtml(reference);
  const safeFocusGoal = escapeHtml(breakdown.focusGoal || "Not specified");
  const safeIncomeSource = escapeHtml(breakdown.incomeSource || "Not specified");
  const safePathTitle = escapeHtml(breakdown.recommendedPath.title);
  const safePathReason = escapeHtml(breakdown.recommendedPath.reason);
  const safePathHref = escapeHtml(resolveEmailUrl(breakdown.recommendedPath.href));
  const safeGuideHref = escapeHtml(resolveEmailUrl(breakdown.recommendedPath.guideHref));

  const sectionRows = breakdown.sections
    .map((section) => {
      const metric =
        section.section === "D"
          ? `${section.answered}/${section.total} answered`
          : `${section.gaps} gap${section.gaps === 1 ? "" : "s"} (${section.answered}/${section.total} answered)`;
      return `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#142133;border-bottom:1px solid rgba(92,74,31,0.12);">
            <strong>Section ${escapeHtml(section.section)}: ${escapeHtml(section.label)}</strong>
          </td>
          <td align="right" style="padding:8px 0;font-size:14px;color:#39465a;border-bottom:1px solid rgba(92,74,31,0.12);">
            ${escapeHtml(metric)}
          </td>
        </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f6f1e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1e8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#fffdf9;border-radius:16px;overflow:hidden;box-shadow:0 18px 40px rgba(23,34,52,0.09);">

          <!-- Header -->
          <tr>
            <td style="background:#142133;padding:32px 40px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#d3b46a;">Financial Clarity Assessment</p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:500;color:#fffdf9;font-style:italic;">
                ${safeBracket}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#142133;">
                Hi <strong>${safeName}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#39465a;">
                ${safeSummary}
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#677489;font-style:italic;">
                ${safeRecommendation}
              </p>

              <!-- Section breakdown -->
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b4903a;">
                Section breakdown (${breakdown.totalScore}/26 total gaps)
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${sectionRows}
              </table>

              <!-- Matched path -->
              <div style="background:#f6f1e8;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b4903a;">
                  Matched next step
                </p>
                <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#142133;">
                  ${safePathTitle}
                </p>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#39465a;">
                  ${safePathReason}
                </p>
                <p style="margin:0 0 14px;font-size:13px;color:#677489;">
                  Primary income (Q27): <strong>${safeIncomeSource}</strong> · 30-day direction (Q31): <strong>${safeFocusGoal}</strong>
                </p>
                <p style="margin:0;font-size:13px;">
                  <a href="${safePathHref}" style="color:#142133;font-weight:600;text-decoration:underline;margin-right:16px;">Explore ${safePathTitle}</a>
                  <a href="${safeGuideHref}" style="color:#b4903a;text-decoration:underline;">Read the Investment Guide</a>
                </p>
              </div>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(92,74,31,0.16);margin:24px 0;" />

              <!-- Next step -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#b4903a;">Next step</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#39465a;">
                Continue the conversation and explore your wealth-building path:
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:#142133;border-radius:100px;padding:14px 28px;">
                    <a href="https://wa.link/fz5g34" style="font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#fffdf9;text-decoration:none;">
                      Continue on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:16px;">
                    <a href="https://signature.9jawealth.com/" style="font-size:13px;color:#b4903a;text-decoration:underline;">Lekki Avana Signature</a>
                  </td>
                  <td>
                    <a href="https://palmville.9jawealth.com/" style="font-size:13px;color:#b4903a;text-decoration:underline;">PalmVille Agro Real Estate</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f6f1e8;padding:24px 40px;">
              <p style="margin:0;font-size:12px;color:#677489;">
                Reference: ${safeReference} · 9jawealth
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

async function handlePropertyEnquiry(
  body: Record<string, unknown>,
  res: VercelResponse,
  deps: SendReportDependencies = defaultDeps,
) {
  const honeypot =
    typeof body._honey === "string"
      ? body._honey.trim()
      : typeof body.website === "string"
        ? body.website.trim()
        : "";
  if (honeypot !== "") {
    return res.status(200).json({ ok: true, success: true, reference: crypto.randomUUID() });
  }

  const name = normalizeName(body.name ?? body["Full Name"] ?? body.fullName).slice(0, 120);
  const rawEmail = body.email ?? body.Email ?? body["Email Address"];
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const rawPhone = body.phone ?? body.Phone ?? body["Phone Number"];
  const phone = typeof rawPhone === "string" ? rawPhone.trim().slice(0, 40) : "";
  const rawPlotSize =
    body.plotSize ??
    body["Plot Size"] ??
    body["Preferred Land Size"] ??
    body.strategy ??
    body.Strategy ??
    body["Investment Strategy"];
  const plotSize = typeof rawPlotSize === "string" ? rawPlotSize.trim().slice(0, 80) : "";
  const rawPlan = body.paymentPlan ?? body["Payment Plan"] ?? body["Preferred Payment Plan"];
  const paymentPlan = typeof rawPlan === "string" ? rawPlan.trim().slice(0, 80) : "";
  const rawMessage = body.message ?? body.Message;
  const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, 1000) : "";
  const rawPreferredTime =
    body.preferredTime ?? body.preferredDate ?? body["Preferred Date & Time"];
  const preferredTime =
    typeof rawPreferredTime === "string" ? rawPreferredTime.trim().slice(0, 120) : "";
  const fullMessage = [
    message,
    preferredTime && !message.includes(preferredTime) ? `Preferred Time: ${preferredTime}` : "",
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 1000);

  const isConsultationType = body.type === "consultation-booking";
  const rawSource = body.source;
  const source =
    typeof rawSource === "string" && rawSource.trim()
      ? rawSource.trim().slice(0, 80)
      : isConsultationType
        ? "Investment Guide Consultation"
        : "Property Enquiry";
  const isConsultation =
    isConsultationType || source.toLowerCase().includes("consultation");

  const rawTraffic = body.trafficSource ?? body.landing_page ?? body.referrer;
  const trafficSource =
    typeof rawTraffic === "string" ? rawTraffic.trim().slice(0, 240) : "";

  if (name.length < 2 || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid name and email address" });
  }

  const reference = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const detailLabel = isConsultation ? "Strategy" : "Plot Size";
  const summary =
    [
      plotSize ? `${detailLabel}: ${plotSize}` : "",
      paymentPlan ? `Plan: ${paymentPlan}` : "",
      phone ? `Phone: ${phone}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || `${source} enquiry`;

  const larkOutcome = await tryCreateLarkLead(
    {
      name,
      email,
      phone,
      plotSize,
      paymentPlan,
      message: fullMessage,
      source,
      trafficSource,
      reference,
      submittedAt,
      result: {
        bracket: plotSize || source,
        summary,
        recommendation:
          fullMessage ||
          (isConsultation
            ? `Follow up on ${source}${plotSize ? ` (${plotSize})` : ""}`
            : `Follow up on ${source} (${paymentPlan || "standard plan"})`),
      },
    },
    deps.createLarkLeadRecord,
  );
  const larkPersisted = larkOutcome.ok && larkOutcome.recordId !== null;

  const waUrl = source.toLowerCase().includes("palmville")
    ? "https://wa.link/gv7ic6"
    : isConsultation
      ? "https://wa.link/fz5g34"
      : "https://wa.link/6fjyon";

  let buyerMailSent = false;
  try {
    const buyerSubject = isConsultation
      ? `We received your ${source} request`
      : `We received your ${source} enquiry`;
    const buyerIntro = isConsultation
      ? `Thank you for requesting an ${source}.`
      : `Thank you for your interest in ${source}.`;
    const buyerNextStep = isConsultation
      ? `Our team will reach out shortly to confirm your 30-minute strategy session. For an immediate response, chat with us on WhatsApp: ${waUrl}`
      : `Our team will reach out shortly with the current brochure, availability, and payment schedule. For an immediate response, chat with us on WhatsApp: ${waUrl}`;
    const buyerHtmlBody = isConsultation
      ? `We have received your consultation request (${escapeHtml(summary)}). Our team will reach out shortly to confirm your 30-minute strategy session.`
      : `We have received your enquiry (${escapeHtml(summary)}). Our team will reach out shortly with availability and payment options.`;

    await deps.sendMail({
      to: email,
      subject: buyerSubject,
      text: [
        `Hi ${name},`,
        buyerIntro,
        summary,
        buyerNextStep,
        `Reference: ${reference} · 9jawealth`,
      ].join("\n\n"),
      html: `
<!DOCTYPE html>
<html lang="en">
<body style="font-family:Arial,Helvetica,sans-serif;color:#142133;line-height:1.6;">
  <h2>${escapeHtml(buyerIntro)}</h2>
  <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
  <p>${buyerHtmlBody}</p>
  <p><a href="${waUrl}" style="display:inline-block;background:#122A1C;color:#FBF7EE;padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:bold;">Chat with Olanrewaju on WhatsApp</a></p>
  <p style="font-size:12px;color:#677489;">Reference: ${escapeHtml(reference)} · 9jawealth</p>
</body>
</html>`.trim(),
    });
    buyerMailSent = true;
  } catch (buyerMailErr) {
    console.error("[send-report] Buyer confirmation email error:", buyerMailErr);
  }

  let ownerMailSent = false;
  try {
    await sendOwnerNotificationWithFallback(
      {
        subject: `New ${source} lead: ${name}${plotSize ? ` — ${plotSize}` : ""}`,
        replyTo: email,
        text: [
          `New ${source} ${isConsultation ? "request" : "enquiry"}`,
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "N/A"}`,
          `${detailLabel}: ${plotSize || "N/A"}`,
          `Payment Plan: ${paymentPlan || "N/A"}`,
          `Message: ${fullMessage || "N/A"}`,
          `Traffic Source: ${trafficSource || "Direct"}`,
          `Reference: ${reference}`,
        ].join("\n"),
        html: `
<!DOCTYPE html>
<html lang="en">
<body style="font-family:Arial,Helvetica,sans-serif;color:#142133;line-height:1.6;">
  <h2>New ${escapeHtml(source)} ${isConsultation ? "request" : "enquiry"}</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
  <p><strong>${escapeHtml(detailLabel)}:</strong> ${escapeHtml(plotSize || "N/A")}</p>
  <p><strong>Payment Plan:</strong> ${escapeHtml(paymentPlan || "N/A")}</p>
  <p><strong>Message:</strong> ${escapeHtml(fullMessage || "N/A")}</p>
  <p><strong>Traffic Source:</strong> ${escapeHtml(trafficSource || "Direct")}</p>
  <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
</body>
</html>`.trim(),
      },
      deps,
    );
    ownerMailSent = true;
  } catch (ownerMailErr) {
    console.error("[send-report] Property owner notification error:", ownerMailErr);
  }

  if (!larkPersisted && !ownerMailSent) {
    return res.status(500).json({
      error: "Unable to capture your request right now. Please reach us directly on WhatsApp.",
      reference,
    });
  }

  const emailSent = buyerMailSent || ownerMailSent;
  const responseMessage = isConsultation
    ? emailSent
      ? "Consultation booking captured and confirmation sent"
      : "Consultation booking captured in CRM; email notification could not be sent"
    : emailSent
      ? "Enquiry captured and notification sent"
      : "Enquiry captured in CRM; email notification could not be sent";

  return res.status(200).json({
    ok: true,
    success: true,
    reference,
    larkCaptured: larkPersisted,
    emailSent,
    message: responseMessage,
  });
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export function createSendReportHandler(overrides: Partial<SendReportDependencies> = {}) {
  const deps: SendReportDependencies = { ...defaultDeps, ...overrides };

  return async function sendReportHandler(req: VercelRequest, res: VercelResponse) {
    if (req.method === "OPTIONS") {
      if (!applyCors(req, res)) return;
      return res.status(204).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!applyCors(req, res)) return;

    const { limited, retryAfter } = isRateLimited(getClientIp(req));
    if (limited) {
      res.setHeader("Retry-After", String(retryAfter));
      return res
        .status(429)
        .json({ error: "Too many submissions. Please try again later." });
    }

    try {
      const body = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
        string,
        unknown
      >;

      if (body.type === "property-enquiry" || body.type === "consultation-booking") {
        return await handlePropertyEnquiry(body, res, deps);
      }

      // Honeypot: bots fill `website`; humans never see it. Pretend success.
      if (typeof body.website === "string" && body.website.trim() !== "") {
        return res.status(200).json({
          ok: true,
          reference: crypto.randomUUID(),
          message: "Assessment captured and email sent",
        });
      }

      // Minimum dwell time: block scripted sub-2-second submissions while tolerating browser clock skew.
      if (isSubmissionTooFast(body)) {
        return res
          .status(429)
          .json({ error: "Submission too fast. Please take the assessment first." });
      }

      const validation = validateSubmission(body);
      if (!validation.ok || !validation.value) {
        return res
          .status(400)
          .json({ error: validation.errors[0] || "Missing required submission fields" });
      }
      const { name, email, answers, submittedAt } = validation.value;

      // Server-authoritative result: never trust client-supplied brackets.
      const result = computeQuizResult(answers);
      const breakdown = getQuizBreakdown(answers);
      const leadResult = buildRichLeadResult(result, breakdown);

      const reference = crypto.randomUUID();
      const datePrefix = submittedAt.slice(0, 10);
      const blobPath = `submissions/${datePrefix}/${slugify(name) || "assessment"}-${reference}.json`;

      // 1. Persist lead in Lark Base and Vercel Blob BEFORE SMTP delivery so
      // an unverified Resend domain or SMTP outage never drops a completed lead.
      const larkOutcome = await tryCreateLarkLead(
        { name, email, result: leadResult, reference, submittedAt },
        deps.createLarkLeadRecord,
      );
      const larkPersisted = larkOutcome.ok && larkOutcome.recordId !== null;

      if (process.env.BLOB_ENABLED !== "false" && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          await deps.putBlob(
            blobPath,
            JSON.stringify(
              {
                reference,
                submittedAt,
                name,
                emailHash: hashEmail(email),
                emailMasked: maskEmail(email),
                answers,
                result,
                breakdown,
              },
              null,
              2,
            ),
            {
              contentType: "application/json; charset=utf-8",
              access: "public",
              addRandomSuffix: true,
            },
          );
        } catch (blobError) {
          console.error("[send-report] Blob storage error:", blobError);
          // Non-fatal — continue to email delivery
        }
      }

      // 2. Send report and owner notification through Resend SMTP
      const emailHtml = buildEmailHtml(name, result, reference, breakdown);
      const emailText = [
        `Hi ${name},`,
        `Your result: ${result.bracket}`,
        result.summary,
        result.recommendation,
        `Section breakdown: ${formatSectionBreakdownSummary(breakdown)}`,
        `Primary income (Q27): ${breakdown.incomeSource || "Not specified"} · 30-day direction (Q31): ${breakdown.focusGoal || "Not specified"}`,
        `Matched path: ${breakdown.recommendedPath.title} (${resolveEmailUrl(breakdown.recommendedPath.href)})`,
        `Reference: ${reference} · 9jawealth`,
      ].join("\n\n");

      let visitorEmailError: unknown = null;
      try {
        await deps.sendMail({
          to: email,
          subject: `Your Financial Clarity Result: ${result.bracket}`,
          html: emailHtml,
          text: emailText,
        });
      } catch (emailError) {
        visitorEmailError = emailError;
        console.error("[send-report] Email error:", emailError);
      }

      let ownerNotificationError: unknown = null;
      try {
        const leadNotification = buildLeadNotification({
          name,
          email,
          result: leadResult,
          reference,
        });
        await sendOwnerNotificationWithFallback(
          {
            subject: leadNotification.subject,
            html: leadNotification.html,
            text: leadNotification.text,
            replyTo: leadNotification.replyTo,
          },
          deps,
        );
      } catch (notificationError) {
        ownerNotificationError = notificationError;
        console.error("[send-report] Owner notification error:", notificationError);
      }

      if (visitorEmailError || ownerNotificationError) {
        if (larkPersisted) {
          return res.status(200).json({
            ok: true,
            reference,
            result,
            larkCaptured: true,
            emailSent: false,
            message:
              "Assessment saved to our system, but automated email delivery is currently delayed.",
            warning:
              "Assessment saved to our system, but automated email delivery is currently delayed. Save your reference ID or message Olanrewaju directly on WhatsApp.",
          });
        }

        if (visitorEmailError) {
          return res.status(500).json({
            error: "Unable to send the assessment email",
            reference,
          });
        }

        return res.status(500).json({
          error: "Unable to notify the assessment owner",
          reference,
        });
      }

      return res.status(200).json({
        ok: true,
        reference,
        result,
        larkCaptured: larkPersisted,
        emailSent: true,
        message: "Assessment captured and email sent",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[send-report] Unhandled error:", message);
      return res.status(500).json({ error: message });
    }
  };
}

const defaultHandler = createSendReportHandler();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return defaultHandler(req, res);
}

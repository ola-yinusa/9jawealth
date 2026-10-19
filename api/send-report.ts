import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMailConfig, sendMail } from "../src/lib/mailer.js";
import { createLarkLeadRecord, type LeadRecordInput } from "../src/lib/lark-base.js";
import { put } from "@vercel/blob";
import {
  computeQuizResult,
  escapeHtml,
  isValidEmail,
  maskEmail,
  normalizeName,
  validateSubmission,
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
/*  CORS allowlist (same-origin + owner domains; no wildcard)           */
/* ------------------------------------------------------------------ */

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv.length > 0
    ? fromEnv
    : [
        "https://www.9jawealth.com",
        "https://9jawealth.com",
        "https://signature.9jawealth.com",
        "https://palmville.9jawealth.com",
      ];
}

function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  if (!origin) return true; // same-origin / non-browser request
  if (!getAllowedOrigins().includes(origin)) {
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

export async function captureLeadInLark(input: LeadRecordInput): Promise<boolean> {
  try {
    await createLarkLeadRecord(input);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Lark error";
    console.error("[send-report] Lark lead capture failed", input.reference, message);
    return false;
  }
}

async function sendOwnerNotificationWithFallback(input: {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}): Promise<void> {
  const mailConfig = getMailConfig();
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
      await sendMail({
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

function buildEmailHtml(
  name: string,
  result: { bracket: string; summary: string; recommendation: string },
  reference: string,
): string {
  const safeName = escapeHtml(name);
  const safeBracket = escapeHtml(result.bracket);
  const safeSummary = escapeHtml(result.summary);
  const safeRecommendation = escapeHtml(result.recommendation);
  const safeReference = escapeHtml(reference);
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
) {
  const honeypot = typeof body._honey === "string" ? body._honey.trim() : "";
  if (honeypot !== "") {
    return res.status(200).json({ ok: true, success: true, reference: crypto.randomUUID() });
  }

  const name = normalizeName(body.name ?? body["Full Name"]);
  const rawEmail = body.email ?? body.Email ?? body["Email Address"];
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const rawPhone = body.phone ?? body.Phone ?? body["Phone Number"];
  const phone = typeof rawPhone === "string" ? rawPhone.trim().slice(0, 40) : "";
  const rawPlotSize = body.plotSize ?? body["Plot Size"] ?? body["Preferred Land Size"];
  const plotSize = typeof rawPlotSize === "string" ? rawPlotSize.trim().slice(0, 80) : "";
  const rawPlan = body.paymentPlan ?? body["Payment Plan"] ?? body["Preferred Payment Plan"];
  const paymentPlan = typeof rawPlan === "string" ? rawPlan.trim().slice(0, 80) : "";
  const rawMessage = body.message ?? body.Message;
  const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, 1000) : "";
  const rawSource = body.source;
  const source =
    typeof rawSource === "string" && rawSource.trim()
      ? rawSource.trim().slice(0, 80)
      : "Property Enquiry";
  const rawTraffic = body.trafficSource ?? body.landing_page;
  const trafficSource =
    typeof rawTraffic === "string" ? rawTraffic.trim().slice(0, 240) : "";

  if (name.length < 2 || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid name and email address" });
  }

  const reference = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const summary = [
    plotSize ? `Plot Size: ${plotSize}` : "",
    paymentPlan ? `Plan: ${paymentPlan}` : "",
    phone ? `Phone: ${phone}` : "",
  ]
    .filter(Boolean)
    .join(" · ") || `${source} enquiry`;

  await captureLeadInLark({
    name,
    email,
    phone,
    plotSize,
    paymentPlan,
    message,
    source,
    trafficSource,
    reference,
    submittedAt,
    result: {
      bracket: plotSize || source,
      summary,
      recommendation: message || `Follow up on ${source} (${paymentPlan || "standard plan"})`,
    },
  });

  const waUrl = source.toLowerCase().includes("palmville")
    ? "https://wa.link/gv7ic6"
    : "https://wa.link/6fjyon";

  try {
    await sendMail({
      to: email,
      subject: `We received your ${source} enquiry`,
      text: [
        `Hi ${name},`,
        `Thank you for your interest in ${source}.`,
        summary,
        `Our team will reach out shortly with the current brochure, availability, and payment schedule. For an immediate response, chat with us on WhatsApp: ${waUrl}`,
        `Reference: ${reference} · 9jawealth`,
      ].join("\n\n"),
      html: `
<!DOCTYPE html>
<html lang="en">
<body style="font-family:Arial,Helvetica,sans-serif;color:#142133;line-height:1.6;">
  <h2>Thank you for your interest in ${escapeHtml(source)}</h2>
  <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
  <p>We have received your enquiry (${escapeHtml(summary)}). Our team will reach out shortly with availability and payment options.</p>
  <p><a href="${waUrl}" style="display:inline-block;background:#122A1C;color:#FBF7EE;padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:bold;">Chat with Olanrewaju on WhatsApp</a></p>
  <p style="font-size:12px;color:#677489;">Reference: ${escapeHtml(reference)} · 9jawealth</p>
</body>
</html>`.trim(),
    });
  } catch (buyerMailErr) {
    console.error("[send-report] Buyer confirmation email error:", buyerMailErr);
  }

  try {
    await sendOwnerNotificationWithFallback({
      subject: `New ${source} lead: ${name}${plotSize ? ` — ${plotSize}` : ""}`,
      replyTo: email,
      text: [
        `New ${source} enquiry`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "N/A"}`,
        `Plot Size: ${plotSize || "N/A"}`,
        `Payment Plan: ${paymentPlan || "N/A"}`,
        `Message: ${message || "N/A"}`,
        `Traffic Source: ${trafficSource || "Direct"}`,
        `Reference: ${reference}`,
      ].join("\n"),
      html: `
<!DOCTYPE html>
<html lang="en">
<body style="font-family:Arial,Helvetica,sans-serif;color:#142133;line-height:1.6;">
  <h2>New ${escapeHtml(source)} enquiry</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p><strong>Phone:</strong> ${escapeHtml(phone || "N/A")}</p>
  <p><strong>Plot Size:</strong> ${escapeHtml(plotSize || "N/A")}</p>
  <p><strong>Payment Plan:</strong> ${escapeHtml(paymentPlan || "N/A")}</p>
  <p><strong>Message:</strong> ${escapeHtml(message || "N/A")}</p>
  <p><strong>Traffic Source:</strong> ${escapeHtml(trafficSource || "Direct")}</p>
  <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
</body>
</html>`.trim(),
    });
  } catch (ownerMailErr) {
    console.error("[send-report] Property owner notification error:", ownerMailErr);
  }

  return res.status(200).json({
    ok: true,
    success: true,
    reference,
    message: "Enquiry captured and notification sent",
  });
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const body = req.body as Record<string, unknown>;

    if (body && body.type === "property-enquiry") {
      return await handlePropertyEnquiry(body, res);
    }

    // Honeypot: bots fill `website`; humans never see it. Pretend success.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return res.status(200).json({
        ok: true,
        reference: crypto.randomUUID(),
        message: "Assessment captured and email sent",
      });
    }

    // Minimum dwell time: submissions faster than 8s after page start are bots.
    if (typeof body.startedAt === "string" && body.startedAt) {
      const started = new Date(body.startedAt).getTime();
      if (!Number.isNaN(started) && Date.now() - started < 8000) {
        return res
          .status(429)
          .json({ error: "Submission too fast. Please take the assessment first." });
      }
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

    const reference = crypto.randomUUID();
    const datePrefix = submittedAt.slice(0, 10);
    const blobPath = `submissions/${datePrefix}/${slugify(name) || "assessment"}-${reference}.json`;

    // 1. Send email through Resend SMTP
    const emailHtml = buildEmailHtml(name, result, reference);
    const emailText = [
      `Hi ${name},`,
      `Your result: ${result.bracket}`,
      result.summary,
      result.recommendation,
      `Reference: ${reference} · 9jawealth`,
    ].join("\n\n");

    try {
      await sendMail({
        to: email,
        subject: `Your Financial Clarity Result: ${result.bracket}`,
        html: emailHtml,
        text: emailText,
      });
    } catch (emailError) {
      console.error("[send-report] Email error:", emailError);
      return res.status(500).json({ error: "Unable to send the assessment email" });
    }

    try {
      const leadNotification = buildLeadNotification({ name, email, result, reference });
      await sendOwnerNotificationWithFallback({
        subject: leadNotification.subject,
        html: leadNotification.html,
        text: leadNotification.text,
        replyTo: leadNotification.replyTo,
      });
    } catch (notificationError) {
      console.error("[send-report] Owner notification error:", notificationError);
      return res.status(500).json({ error: "Unable to notify the assessment owner" });
    }

    await captureLeadInLark({ name, email, result, reference, submittedAt });

    // 3. Store a redacted backup in Vercel Blob.
    if (process.env.BLOB_ENABLED !== "false" && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await put(
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
        // Non-fatal — email was already sent
      }
    }

    return res.status(200).json({
      ok: true,
      reference,
      result,
      message: "Assessment captured and email sent",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-report] Unhandled error:", message);
    return res.status(500).json({ error: message });
  }
}

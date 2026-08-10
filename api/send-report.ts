import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendMail } from "../src/lib/mailer";
import { put } from "@vercel/blob";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SubmissionPayload {
    name: string;
    email: string;
    answers: Record<string, string>;
    result: {
        bracket: string;
        summary: string;
        recommendation: string;
    };
    submittedAt: string;
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

function buildEmailHtml(payload: SubmissionPayload, reference: string): string {
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
                ${payload.result.bracket}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#142133;">
                Hi <strong>${payload.name}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#39465a;">
                ${payload.result.summary}
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#677489;font-style:italic;">
                ${payload.result.recommendation}
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
                    <a href="https://forex.9jawealth.com" style="font-size:13px;color:#b4903a;text-decoration:underline;">Forex education</a>
                  </td>
                  <td style="font-size:13px;color:#677489;">Real estate path coming soon</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f6f1e8;padding:24px 40px;">
              <p style="margin:0;font-size:12px;color:#677489;">
                Reference: ${reference} · 9jawealth
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

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS preflight
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const payload = req.body as SubmissionPayload;

        // Validate
        if (!payload.name || !payload.email || !payload.answers || !payload.result) {
            return res.status(400).json({ error: "Missing required submission fields" });
        }

        const reference = crypto.randomUUID();
        const submittedAt = payload.submittedAt || new Date().toISOString();
        const datePrefix = submittedAt.slice(0, 10);
        const blobPath = `submissions/${datePrefix}/${slugify(payload.name) || "assessment"}-${reference}.json`;

        // 1. Send email through GO54 Cloud Mail SMTP
        const emailHtml = buildEmailHtml(payload, reference);
        const emailText = [
            `Hi ${payload.name},`,
            payload.result.summary,
            payload.result.recommendation,
            `Reference: ${reference} · 9jawealth`,
        ].join("\n\n");

        try {
            await sendMail({
                to: payload.email,
                subject: `Your Financial Clarity Result: ${payload.result.bracket}`,
                html: emailHtml,
                text: emailText,
            });
        } catch (emailError) {
            console.error("[send-report] Email error:", emailError);
            return res.status(500).json({ error: "Unable to send the assessment email" });
        }

        // 2. Store in Vercel Blob (backup)
        let blobUrl: string | null = null;
        try {
            const blobPayload = {
                ...payload,
                submittedAt,
                reference,
            };

            const blob = await put(blobPath, JSON.stringify(blobPayload, null, 2), {
                contentType: "application/json; charset=utf-8",
                access: "public",
            });

            blobUrl = blob.url;
        } catch (blobError) {
            console.error("[send-report] Blob storage error:", blobError);
            // Non-fatal — email was already sent
        }

        return res.status(200).json({
            ok: true,
            reference,
            message: "Assessment captured and email sent",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[send-report] Unhandled error:", message);
        return res.status(500).json({ error: message });
    }
}

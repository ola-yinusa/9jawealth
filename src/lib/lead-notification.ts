import { escapeHtml, type QuizResult } from "./assessment.js";

export interface LeadNotificationInput {
  name: string;
  email: string;
  result: QuizResult;
  reference: string;
}

export interface LeadNotification {
  subject: string;
  replyTo: string;
  text: string;
  html: string;
}

export function buildLeadNotification(input: LeadNotificationInput): LeadNotification {
  const { name, email, result, reference } = input;
  const text = [
    "New 9jawealth assessment lead",
    `Name: ${name}`,
    `Email: ${email}`,
    `Result: ${result.bracket}`,
    `Summary: ${result.summary}`,
    `Recommendation: ${result.recommendation}`,
    `Reference: ${reference}`,
  ].join("\n");

  return {
    subject: `New assessment lead: ${name} — ${result.bracket}`,
    replyTo: email,
    text,
    html: `
<!DOCTYPE html>
<html lang="en">
<body style="font-family:Arial,Helvetica,sans-serif;color:#142133;line-height:1.6;">
  <h2>New 9jawealth assessment lead</h2>
  <p><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p><strong>Result:</strong> ${escapeHtml(result.bracket)}</p>
  <p><strong>Summary:</strong> ${escapeHtml(result.summary)}</p>
  <p><strong>Recommendation:</strong> ${escapeHtml(result.recommendation)}</p>
  <p><strong>Reference:</strong> ${escapeHtml(reference)}</p>
</body>
</html>`.trim(),
  };
}

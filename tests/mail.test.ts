import { test } from "node:test";
import assert from "node:assert/strict";
import { getMailConfig } from "../src/lib/mailer.ts";
import { buildLeadNotification } from "../src/lib/lead-notification.ts";

test("uses Resend SMTP defaults and server credentials", () => {
  const original = {
    host: process.env.RESEND_SMTP_HOST,
    port: process.env.RESEND_SMTP_PORT,
    user: process.env.RESEND_SMTP_USER,
    password: process.env.RESEND_SMTP_PASSWORD,
    from: process.env.RESEND_MAIL_FROM,
    replyTo: process.env.RESEND_REPLY_TO,
    notifyTo: process.env.RESEND_NOTIFY_TO,
  };

  process.env.RESEND_SMTP_USER = "resend";
  process.env.RESEND_SMTP_PASSWORD = "re_test_api_key";
  delete process.env.RESEND_SMTP_HOST;
  delete process.env.RESEND_SMTP_PORT;
  delete process.env.RESEND_MAIL_FROM;
  delete process.env.RESEND_REPLY_TO;
  delete process.env.RESEND_NOTIFY_TO;

  try {
    assert.deepEqual(getMailConfig(), {
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      user: "resend",
      password: "re_test_api_key",
      from: "9jawealth <assessment@9jawealth.com>",
      replyTo: "hello@9jawealth.com",
      notifyTo: "hello@9jawealth.com",
    });
  } finally {
    process.env.RESEND_SMTP_HOST = original.host;
    process.env.RESEND_SMTP_PORT = original.port;
    process.env.RESEND_SMTP_USER = original.user;
    process.env.RESEND_SMTP_PASSWORD = original.password;
    process.env.RESEND_MAIL_FROM = original.from;
    process.env.RESEND_REPLY_TO = original.replyTo;
    process.env.RESEND_NOTIFY_TO = original.notifyTo;
  }
});

test("builds a lead notification that replies to the visitor", () => {
  const notification = buildLeadNotification({
    name: "Ada Lovelace",
    email: "ada@example.com",
    result: {
      bracket: "On the right track",
      summary: "A meaningful base is in place.",
      recommendation: "Build a clearer system.",
    },
    reference: "ref-123",
  });

  assert.equal(notification.subject, "New assessment lead: Ada Lovelace — On the right track");
  assert.equal(notification.replyTo, "ada@example.com");
  assert.equal(
    notification.text,
    [
      "New 9jawealth assessment lead",
      "Name: Ada Lovelace",
      "Email: ada@example.com",
      "Result: On the right track",
      "Summary: A meaningful base is in place.",
      "Recommendation: Build a clearer system.",
      "Reference: ref-123",
    ].join("\n"),
  );
  assert.match(notification.html, /Ada Lovelace/);
});

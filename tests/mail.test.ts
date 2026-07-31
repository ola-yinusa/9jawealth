import { test } from "node:test";
import assert from "node:assert/strict";
import { getMailConfig } from "../src/lib/mailer.ts";

test("uses GO54 Cloud Mail defaults and server credentials", () => {
  const original = {
    host: process.env.WHOGOHOST_SMTP_HOST,
    port: process.env.WHOGOHOST_SMTP_PORT,
    user: process.env.WHOGOHOST_SMTP_USER,
    password: process.env.WHOGOHOST_SMTP_PASSWORD,
    from: process.env.WHOGOHOST_MAIL_FROM,
    replyTo: process.env.WHOGOHOST_REPLY_TO,
  };

  process.env.WHOGOHOST_SMTP_USER = "assessment@9jawealth.com";
  process.env.WHOGOHOST_SMTP_PASSWORD = "test-password";
  delete process.env.WHOGOHOST_SMTP_HOST;
  delete process.env.WHOGOHOST_SMTP_PORT;
  delete process.env.WHOGOHOST_MAIL_FROM;
  delete process.env.WHOGOHOST_REPLY_TO;

  try {
    assert.deepEqual(getMailConfig(), {
      host: "smtp.go54mail.com",
      port: 587,
      secure: false,
      user: "assessment@9jawealth.com",
      password: "test-password",
      from: "9jawealth <assessment@9jawealth.com>",
      replyTo: "hello@9jawealth.com",
    });
  } finally {
    process.env.WHOGOHOST_SMTP_HOST = original.host;
    process.env.WHOGOHOST_SMTP_PORT = original.port;
    process.env.WHOGOHOST_SMTP_USER = original.user;
    process.env.WHOGOHOST_SMTP_PASSWORD = original.password;
    process.env.WHOGOHOST_MAIL_FROM = original.from;
    process.env.WHOGOHOST_REPLY_TO = original.replyTo;
  }
});

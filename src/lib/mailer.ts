import nodemailer from "nodemailer";

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  replyTo: string;
  notifyTo: string;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required email configuration: ${name}`);
  }
  return value;
}

export function getMailConfig(): MailConfig {
  const port = Number.parseInt(process.env.RESEND_SMTP_PORT || "465", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("RESEND_SMTP_PORT must be a positive integer");
  }

  const user = requiredEnv("RESEND_SMTP_USER");

  return {
    host: process.env.RESEND_SMTP_HOST?.trim() || "smtp.resend.com",
    port,
    secure: port === 465,
    user,
    password: requiredEnv("RESEND_SMTP_PASSWORD"),
    from: process.env.RESEND_MAIL_FROM?.trim() || "9jawealth <assessment@9jawealth.com>",
    replyTo: process.env.RESEND_REPLY_TO?.trim() || "hello@9jawealth.com",
    notifyTo: process.env.RESEND_NOTIFY_TO?.trim() || "hello@9jawealth.com",
  };
}

export async function sendMail(input: SendMailInput): Promise<string> {
  const config = getMailConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  const result = await transporter.sendMail({
    from: config.from,
    to: input.to,
    replyTo: input.replyTo || config.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return result.messageId;
}

import nodemailer from "nodemailer";

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  replyTo: string;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required email configuration: ${name}`);
  }
  return value;
}

export function getMailConfig(): MailConfig {
  const port = Number.parseInt(process.env.WHOGOHOST_SMTP_PORT || "587", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("WHOGOHOST_SMTP_PORT must be a positive integer");
  }

  const user = requiredEnv("WHOGOHOST_SMTP_USER");

  return {
    host: process.env.WHOGOHOST_SMTP_HOST?.trim() || "smtp.go54mail.com",
    port,
    secure: port === 465,
    user,
    password: requiredEnv("WHOGOHOST_SMTP_PASSWORD"),
    from: process.env.WHOGOHOST_MAIL_FROM?.trim() || `9jawealth <${user}>`,
    replyTo: process.env.WHOGOHOST_REPLY_TO?.trim() || "hello@9jawealth.com",
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
    replyTo: config.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return result.messageId;
}

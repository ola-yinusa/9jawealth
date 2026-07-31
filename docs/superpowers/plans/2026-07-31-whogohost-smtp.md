# WhoGoHost SMTP Email Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Resend email delivery with authenticated GO54 Cloud Mail SMTP while preserving the assessment form's API contract and result email.

**Architecture:** The existing `/api/send-report` Vercel function remains the only server entry point. A small SMTP mailer module will own transport creation and message sending; its configuration is read from server-only environment variables. The handler will call the mailer and return an error when SMTP rejects the message.

**Tech Stack:** TypeScript, Vercel Node functions, Nodemailer, GO54 Cloud Mail SMTP, Vercel Blob.

---

### Task 1: Add the SMTP client dependency and focused mailer tests

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/mail.test.ts`

- [ ] **Step 1: Add a test command and the SMTP client dependencies**

Add `nodemailer` to dependencies, `@types/nodemailer` to devDependencies, and add:

```json
"test": "node --import tsx --test"
```

- [ ] **Step 2: Write the failing focused test**

Test that a GO54 configuration uses `smtp.go54mail.com`, port `587`, STARTTLS mode, and the server-provided credentials without contacting the network.

- [ ] **Step 3: Run the focused test and verify it fails because the mailer does not exist yet**

Run:

```bash
npm test -- tests/mail.test.ts
```

Expected: FAIL because `src/lib/mailer.ts` has not been created.

### Task 2: Implement the GO54 SMTP mailer

**Files:**
- Create: `src/lib/mailer.ts`

- [ ] **Step 1: Implement environment-driven transport configuration**

Expose a small function that reads `WHOGOHOST_SMTP_HOST`, `WHOGOHOST_SMTP_PORT`, `WHOGOHOST_SMTP_USER`, `WHOGOHOST_SMTP_PASSWORD`, `WHOGOHOST_MAIL_FROM`, and `WHOGOHOST_REPLY_TO`. Default the host to `smtp.go54mail.com`, port to `587`, sender to `assessment@9jawealth.com`, and reply-to to `hello@9jawealth.com`.

- [ ] **Step 2: Implement assessment email sending**

Use Nodemailer with `secure: port === 465`, authenticated SMTP, the existing HTML, a plain-text fallback, and `replyTo`. Return the provider message ID.

- [ ] **Step 3: Run the focused test and verify it passes**

Run:

```bash
npm test -- tests/mail.test.ts
```

Expected: PASS without opening a network connection.

### Task 3: Replace Resend in the API handler

**Files:**
- Modify: `api/send-report.ts:1-3,149-187,209-212`

- [ ] **Step 1: Replace the Resend import and send path**

Remove `Resend`, import the SMTP mailer, send the existing assessment email through GO54, and remove the optional Resend audience-contact call.

- [ ] **Step 2: Make SMTP failures fail the request**

If sending fails, log the error and return HTTP 500 with a clear email-delivery error. Keep the existing Blob backup as a non-fatal operation after a successful send.

- [ ] **Step 3: Run tests and the project checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands complete successfully. No real email is sent during these checks.

### Task 4: Document the server environment

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Replace Resend variables with GO54 SMTP variables**

Document the GO54 host, port, full mailbox username, password placeholder, sender, reply-to, and existing Blob token. Do not add any real credentials.

- [ ] **Step 2: Re-run the checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands complete successfully.

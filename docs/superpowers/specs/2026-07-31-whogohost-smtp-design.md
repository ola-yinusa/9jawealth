# WhoGoHost SMTP Email Delivery Design

**Goal:** Send assessment result emails through the project's GO54 Cloud Mail account instead of Resend.

**Scope:** Replace outbound Resend email delivery in the Vercel API handler with authenticated GO54 SMTP. Keep the existing frontend request contract, assessment email content, and Vercel Blob backup behavior unchanged. Remove the optional Resend audience-contact side effect because WhoGoHost mailbox hosting does not provide that project integration.

**Configuration:** SMTP credentials and sender addresses come from server-only environment variables. The default documented SMTP server is `smtp.go54mail.com` on port `587` with STARTTLS; the implementation will allow the host and port to be overridden without code changes. The sender will default to `assessment@9jawealth.com`, and replies will default to `hello@9jawealth.com`.

**Failure behavior:** SMTP errors must be surfaced as a failed API response rather than returning a false success message. Blob backup remains non-fatal, as it is currently.

**Verification:** Install the SMTP client dependency, run the project's existing type-check/build commands, and run a focused mailer test that verifies the generated transport configuration without contacting the real mailbox.

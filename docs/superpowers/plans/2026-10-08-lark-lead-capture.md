# Lark Base Lead Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write every valid Financial Clarity Assessment submission to a Lark Base lead table while preserving Resend delivery and the existing redacted Blob backup.

**Architecture:** Create a dedicated `9jawealth Leads` Base with an `Assessment Leads` table. Add a small server-only Lark client that obtains and caches a tenant access token, maps validated server-calculated data to Base fields, and creates one record. Invoke it after the existing email sends as best-effort capture; Lark failures are logged with the submission reference but do not undo already-delivered email.

**Tech Stack:** TypeScript, Vercel serverless functions, native `fetch`, Lark Open API, Lark CLI/Base, Node test runner with `tsx`, Vercel environment variables.

**Spec:** `docs/superpowers/specs/2026-10-08-lark-lead-capture-design.md`

## Global Constraints

- Do not add external visitors to the Lark employee/company directory.
- Do not store the complete 31-answer response set in Lark Base by default.
- Use server-only Lark credentials; never expose app secrets or access tokens to the browser.
- Continue server-side result recomputation and existing validation, rate limiting, honeypot, and dwell-time checks.
- Preserve Resend visitor delivery, owner notification, and optional redacted Vercel Blob backup.
- Do not change root-domain MX records or Lark mail routing.
- Do not perform a production deployment during implementation without a separate explicit request.

## Review Focus

- Missing or partially configured Lark variables must not expose secrets or break local development; test the disabled and incomplete configurations in Task 2.
- Expired or rejected tenant tokens must not be reused indefinitely; test token acquisition and API error handling in Task 2.
- Unicode, HTML-sensitive names, and email values must be passed as structured Base cell values without HTML interpolation; test exact field mapping in Task 2.
- Lark failure after successful email delivery must return the existing successful submission contract and preserve the reference; test this integration path in Task 3.
- A non-zero Lark API response code with HTTP 200 must still be treated as failure; test it in Task 2.

---

### Task 1: Create and verify the Lark Base resource

**Files:**
- Create: no repository files; create the external Lark Base resource through `lark-cli`.
- Modify: no code.
- Test: Lark CLI readback of Base, table, and fields.

**Interfaces:**
- Produces: `LARK_BASE_TOKEN`, `LARK_TABLE_ID`, and a Base table with the exact fields required by Task 2.

- [ ] **Step 1: Confirm the Lark Base creation command and current user identity**

Run `lark-cli base +base-create -h` and the relevant identity/status checks. Use the authenticated user identity, not the bot, for resource creation unless the CLI explicitly requires another identity.

- [ ] **Step 2: Create `9jawealth Leads` with an `Assessment Leads` table**

Create these fields with stable names: `Name`, `Email`, `Result`, `Summary`, `Recommendation`, `Reference`, `Submitted At`, `Status`, and `Source`. Use text fields for all except `Submitted At` (date/time) and `Status` (single select with `New`).

- [ ] **Step 3: Read back the Base and table schema**

Use `+base-get`, `+table-list`, and `+field-list` to verify the returned Base token, table ID, field names, and field types. Record the identifiers in the local ignored `.env` only; never print secrets.

- [ ] **Step 4: Verify app/bot access to the created Base**

Use the Lark app identity or the CLI’s supported resource-sharing/access check. If the app cannot access the user-created Base, grant only the minimum Base/table access needed for record creation and read the resource back again.

- [ ] **Step 5: Commit any non-secret setup documentation**

If the Base/table identifiers are documented, commit only documentation or `.env.example` changes. Never commit `.env`, app secrets, access tokens, or user tokens.

### Task 2: Build the tested Lark Base client

**Files:**
- Create: `src/lib/lark-base.ts`
- Test: `tests/lark-base.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `LeadRecordInput` containing `name`, `email`, `result`, `reference`, and `submittedAt`.
- Produces: `createLarkLeadRecord(input: LeadRecordInput): Promise<string | null>`, returning the created record ID or `null` when Lark capture is disabled because all Lark variables are absent.

- [ ] **Step 1: Write failing tests for exact record mapping**

Add a test named `maps a validated lead to the Assessment Leads fields` that injects a fake fetch implementation, asserts the tenant-token request body, asserts the record request path, and checks the exact payload:

```ts
{
  fields: {
    Name: "Ada Lovelace",
    Email: "ada@example.com",
    Result: "On the right track",
    Summary: "Summary",
    Recommendation: "Recommendation",
    Reference: "ref-123",
    "Submitted At": "2026-10-08T10:00:00.000Z",
    Status: "New",
    Source: "Financial Clarity Assessment"
  }
}
```

- [ ] **Step 2: Write failing tests for configuration and API failures**

Cover these cases:

1. All Lark variables absent returns `null` without making a request.
2. A partial configuration throws a safe configuration error that contains no secret value.
3. A non-2xx token or record response throws a safe error.
4. An HTTP 200 response with a non-zero Lark `code` throws a safe error.
5. A successful response returns the record ID.

- [ ] **Step 3: Run the focused tests and confirm the correct failures**

Run `node --import tsx --test tests/lark-base.test.ts`. Expected: the new tests fail because the client module and functions do not exist yet.

- [ ] **Step 4: Implement `src/lib/lark-base.ts`**

Implement:

```ts
export interface LeadRecordInput {
  name: string;
  email: string;
  result: QuizResult;
  reference: string;
  submittedAt: string;
}

export function createLarkLeadRecord(input: LeadRecordInput): Promise<string | null>;
```

Use native `fetch`, `https://open.larksuite.com` as the default API origin, the internal tenant-token endpoint, and the Bitable record-create endpoint. Cache the token only until its reported expiry minus a safety window. Never include `LARK_APP_SECRET` or the token in thrown errors or logs. Treat both HTTP failure and non-zero Lark response `code` as failure.

- [ ] **Step 5: Add the Lark variables to `.env.example`**

Document `LARK_APP_ID`, `LARK_APP_SECRET`, `LARK_BASE_TOKEN`, `LARK_TABLE_ID`, and optional `LARK_API_BASE_URL` with safe placeholders. Keep them marked server-side only.

- [ ] **Step 6: Run the focused tests and confirm they pass**

Run `node --import tsx --test tests/lark-base.test.ts`. Expected: all new client tests pass.

- [ ] **Step 7: Commit the client and tests**

```bash
git add src/lib/lark-base.ts tests/lark-base.test.ts .env.example
git commit -m "feat: add Lark Base lead client"
```

### Task 3: Integrate lead capture into the submission handler

**Files:**
- Modify: `api/send-report.ts`
- Test: `tests/send-report.test.ts` or a focused handler test if the existing test setup supports the Vercel request/response types.

**Interfaces:**
- Consumes: `createLarkLeadRecord` from Task 2 and the existing validated `name`, `email`, `result`, `reference`, and `submittedAt` values.
- Produces: the existing `{ ok: true, reference, result, message }` response, with Lark capture attempted after the two email sends.

- [ ] **Step 1: Write a failing integration test for best-effort Lark capture**

Test that a successful visitor email and owner notification followed by a rejected Lark write still returns HTTP 200 with the same reference and result shape, while the Lark failure is logged without its secret details.

- [ ] **Step 2: Run the focused integration test and confirm it fails**

Run the selected handler test. Expected: the test fails because `send-report` does not yet call the Lark client.

- [ ] **Step 3: Add the Lark capture call after owner notification**

Call `createLarkLeadRecord({ name, email, result, reference, submittedAt })` after the current owner notification succeeds. Catch the error, log only the reference and safe error message, and continue to the Blob backup and success response. Do not add the raw answers to the Lark payload.

- [ ] **Step 4: Run the focused integration test and confirm it passes**

Run the selected handler test. Expected: the existing success contract remains intact and the Lark call is verified.

- [ ] **Step 5: Run the complete repository tests**

Run `npm test`. Expected: assessment, mail, Lark client, and handler tests all pass.

- [ ] **Step 6: Commit the integration**

```bash
git add api/send-report.ts tests/send-report.test.ts
git commit -m "feat: capture assessment leads in Lark Base"
```

### Task 4: Configure, deploy-readiness verify, and document

**Files:**
- Modify: `README.md`
- Modify: `docs/handoff/OWNER-VERCEL-HANDOFF.md`
- Modify: `.env` locally only; never commit it.

**Interfaces:**
- Consumes: `LARK_APP_ID`, `LARK_APP_SECRET`, `LARK_BASE_TOKEN`, and `LARK_TABLE_ID` from Tasks 1–2.
- Produces: configured local/Vercel environments and a verified test record.

- [ ] **Step 1: Add the Lark configuration to the ignored local `.env`**

Populate the four required values from the authenticated Lark app and created Base/table. Do not print the app secret or access token.

- [ ] **Step 2: Add the four Lark variables to Vercel**

Add them as hidden server variables to the root `9jawealth` project and the linked `signature` project for Production, Preview, and Development, matching the existing Resend configuration. Do not deploy yet.

- [ ] **Step 3: Update operational documentation**

Document the Base/table purpose, required variables, no-answer-storage policy, best-effort failure behavior, and the need for a new deployment before production receives the variables.

- [ ] **Step 4: Run the repository verification suite**

Run `npm run verify:all` and `git diff --check`. Expected: lint, tests, both builds, and whitespace checks pass.

- [ ] **Step 5: Create and read back one controlled Lark test record**

Use the server client or a controlled assessment submission only after confirming the exact target Base/table. Read back the record and verify Name, Email, Result, Reference, Submitted At, Status, and Source. Do not send an unsolicited email to a third party.

- [ ] **Step 6: Commit documentation and finish with deployment handoff**

```bash
git add README.md docs/handoff/OWNER-VERCEL-HANDOFF.md
git commit -m "docs: document Lark lead capture setup"
```

Report that a production deployment is still required; do not perform it unless separately requested.

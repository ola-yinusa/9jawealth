# Lark Base Lead Capture Design

Date: 2026-10-08
Status: Ready for review

## Goal

Store each valid Financial Clarity Assessment submission as a lead record in
Lark Base while preserving the current Resend result email, owner notification,
and optional Vercel Blob backup.

The destination is a Lark Base lead table, not the Lark employee/company
directory. External assessment takers should be managed as leads rather than
organization members.

## Scope

### Included

- Create a Lark Base named `9jawealth Leads`.
- Create an `Assessment Leads` table.
- Add one record for each accepted assessment submission.
- Store contact details, server-calculated result information, and a stable
  submission reference.
- Authenticate server-to-server with the Lark app using server-only Vercel
  environment variables.
- Keep the existing Resend and Vercel Blob paths working.
- Add unit tests for record mapping and Lark API behavior.

### Excluded

- Adding external visitors to the Lark employee directory.
- Storing the complete 31-answer response set in Lark Base by default.
- Sending messages through Lark.
- Building a Lark dashboard, workflow, or follow-up automation in this pass.
- Changing root-domain MX records or Lark mail routing.

## Lark Base schema

Base: `9jawealth Leads`

Table: `Assessment Leads`

| Field | Type | Purpose |
|---|---|---|
| Name | Text | Visitor-provided name |
| Email | Text | Visitor email address |
| Result | Text | Server-calculated result bracket |
| Summary | Text | Server-calculated result summary |
| Recommendation | Text | Server-calculated next recommendation |
| Reference | Text | Unique application submission reference |
| Submitted At | Date/time | Validated submission timestamp |
| Status | Single select | Defaults to `New` |
| Source | Text | Defaults to `Financial Clarity Assessment` |

The answer set is not copied to Lark because it contains more detailed
financial self-assessment data than is needed for lead follow-up. The existing
redacted Blob backup remains the detailed audit store.

## Data flow

```text
Quiz form
  -> POST /api/send-report
  -> validate payload
  -> recompute result on server
  -> send visitor result through Resend
  -> send owner notification through Resend
  -> create Assessment Leads record in Lark Base
  -> store redacted Blob backup when configured
  -> return reference to browser
```

The Lark record will use the already validated and server-calculated values;
it will never trust a client-supplied bracket, summary, or recommendation.

## Authentication and configuration

The Vercel function will use a tenant-access-token flow with server-only
configuration:

- `LARK_APP_ID`
- `LARK_APP_SECRET`
- `LARK_BASE_TOKEN`
- `LARK_TABLE_ID`

The app secret will never be exposed to the browser or committed to the
repository. The Base and table identifiers are configuration values, not
secrets, but will still be managed through environment variables for easier
deployment across projects.

The existing Lark CLI user authorization is useful for creating and inspecting
the Base, but its user token will not be embedded in the Vercel function.

## Error handling

The email path remains the current user-facing delivery contract. Lark Base
capture is attempted after the two email sends. If Lark capture fails:

- Log a structured server-side error with the submission reference.
- Do not expose Lark credentials or raw API error details to the visitor.
- Preserve the already-sent email and Blob backup.
- Return a controlled error only if the existing handler contract requires the
  submission to be considered incomplete; otherwise return success and rely on
  the owner notification/log for manual recovery.

The implementation will use best-effort Lark capture with a successful
submission response after email delivery. This preserves the current visitor
experience and avoids duplicate emails when a client retries after an
unrecoverable cross-service failure. The Lark failure will be logged with the
reference and surfaced in server logs for manual recovery.

## Security and privacy

- Escape all values when included in any HTML notification.
- Do not log API keys, app secrets, access tokens, or full API request headers.
- Do not store the full answer set in Lark Base by default.
- Keep Lark credentials in Vercel server environments only.
- Prefer a sending-only Resend key for the deployed app; retain full Resend
  access only for administration.
- Preserve the existing rate limiting, honeypot, dwell-time check, and payload
  validation.

## Testing and verification

Tests will cover:

1. Mapping a validated submission to the exact Lark record fields.
2. Lark API success handling.
3. Lark API failure handling without leaking credentials.
4. Existing assessment scoring and mail behavior remaining green.

Operational verification will cover:

1. Creating the Base/table and reading the resulting schema.
2. Configuring the Lark variables on the root `9jawealth` Vercel project and
   the linked `signature` project where appropriate.
3. Running the repository verification suite.
4. Deploying only after the user explicitly requests the production deployment.
5. Creating one controlled test record or real assessment submission and
   reading it back from Lark Base.

## Implementation boundary

The likely code additions are:

- `src/lib/lark-base.ts` for token acquisition and record creation.
- A focused mapping/helper module or functions for lead records.
- `api/send-report.ts` integration after email delivery.
- `tests/lark-base.test.ts` and any mail-handler tests needed for the failure
  path.
- `.env.example`, README, and deployment handoff documentation.

No production deployment will be performed automatically as part of the
implementation unless separately requested.

# 9jawealth Owner → Vercel Handoff

## Purpose

This document is the Stage 1 handoff for the complete 9jawealth repository: the root Vite/React application (Financial Clarity Assessment + Lekki Avana Signature & PalmVille wealth paths + `/education.html` Investment Guide), along with the static/nested product directories (`lekki-avana-signature/`, `palmville/`, `salaryman/`, and the optional legacy `moneymarkets/` app). It is written for the owner who will create and control the production Vercel projects, domains, email credentials, storage accounts, and external service accounts.

Each standalone product can be deployed as its own Vercel project so it has its own root directory, domain, and release lifecycle.

## Canonical production project

- Project: `9jawealth`
- Framework: Vite + React + TypeScript
- Repository root: `/`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Serverless function: `/api/send-report`
- Intended canonical URL: `https://www.9jawealth.com/`

## What the site does

The main `9jawealth.com` homepage presents:

1. **Financial Clarity Assessment (31 questions)** — the first 26 questions determine one of four result brackets. After completion, visitors submit their name and email address to `/api/send-report`, which persists the lead to Lark Base (`Assessment Leads`) and a redacted JSON backup in Vercel Blob **before** sending the visitor report and owner notification through Resend SMTP (returning `500` if SMTP fails so leads are never lost to an unverified Resend domain or SMTP outage).
2. **About Olanrewaju, WhatsApp CTA, and social links** (`Instagram`, `LinkedIn`, `WhatsApp`).
3. **Two Real-Estate Wealth Paths** — **Lekki Avana Signature** (`https://signature.9jawealth.com/`) and **PalmVille Agro Real Estate** (`https://palmville.9jawealth.com/`). Forex / Money Markets has been removed from the main `9jawealth.com` homepage.
4. **Real Estate Investment Guide (`/education.html`)** — also accessible via `/guide`, `/education`, and `/investment-guide` (via `vercel.json` rewrites), featuring Nigeria real-estate strategies and consultation booking.
5. **CRM Enquiry & Consultation Capture (`/api/send-report`)** — handles both `property-enquiry` (Signature & PalmVille) and `consultation-booking` (`Investment Guide Consultation`) submissions, persisting to Lark Base and sending confirmation + owner lead notifications via Resend.

## Owner-controlled services

The owner should create or control all of the following:

- GitHub repository or equivalent source repository
- Vercel team and production project
- `9jawealth.com` domain and DNS
- Resend account used for assessment delivery
- Vercel Blob store used for submission backups
- WhatsApp destination
- Social accounts and external product domains

Do not commit passwords, SMTP tokens, Blob tokens, or local `.env` files.

## Vercel setup

1. Import the repository into the owner’s Vercel account.
2. Set the project root directory to `/`.
3. Use the Vite framework preset.
4. Set the install command to `npm ci`.
5. Set the build command to `npm run build`.
6. Set the output directory to `dist`.
7. Add the production environment variables listed below.
8. Deploy a preview first.
9. Add `www.9jawealth.com` with the DNS record below, then configure the preferred apex-domain redirect.
10. Verify the assessment submission on the production domain.

## Required production environment variables

Configure these in Vercel Project Settings → Environment Variables. Add them to Production, and to Preview only if preview email delivery is intentionally enabled.

```text
RESEND_SMTP_HOST=smtp.resend.com
RESEND_SMTP_PORT=465
RESEND_SMTP_USER=resend
RESEND_SMTP_PASSWORD=<owner-created Resend API key>
RESEND_MAIL_FROM=9jawealth <assessment@9jawealth.com>
RESEND_REPLY_TO=hello@9jawealth.com
RESEND_NOTIFY_TO=hello@9jawealth.com
LARK_APP_ID=<owner-created Lark app ID>
LARK_APP_SECRET=<owner-copied Lark app secret>
LARK_BASE_TOKEN=<9jawealth Leads Base token>
LARK_TABLE_ID=<Assessment Leads table ID>
BLOB_READ_WRITE_TOKEN=<owner-created Vercel Blob token>
ALLOWED_ORIGINS=https://www.9jawealth.com,https://9jawealth.com,https://signature.9jawealth.com,https://palmville.9jawealth.com
```

Before deployment, verify `9jawealth.com` in Resend and add Resend's SPF/DKIM records. Keep Lark's MX records unchanged so incoming mail and replies continue to reach Lark. The sender domain must be verified before the assessment endpoint can deliver production email.

### `LARK_APP_SECRET` & Lark Base (`Assessment Leads`) setup

- **`LARK_APP_SECRET` setup note:** Copy the actual App Secret directly from the Lark Developer Console (**Credentials & Basic Info**) into Vercel Project Settings → Environment Variables. A CLI keychain reference or masked placeholder is **not** a valid Vercel environment value.
- **Lark permissions:** Ensure the Lark app has Base read and record-create permissions (`bitable:app`) and has been added as an app/collaborator with edit access on the target `9jawealth Leads` Base.
- **Submission reliability:** For the 31-question assessment, `/api/send-report` persists the lead to Lark Base and Vercel Blob **before** attempting Resend SMTP delivery, then returns `500` if email fails—so no lead is dropped if Resend is unverified or experiencing an outage. It does not add external visitors to the employee directory and does not copy the full 31-question answer set into Base.

**Required core columns in `Assessment Leads` (9 columns):**

| Column name | Recommended Lark field type | Notes |
|---|---|---|
| `Name` | Text | Visitor / enquirer full name |
| `Email` | Text / Email | Lowercased email address |
| `Result` | Text | Assessment bracket, plot size, or consultation strategy |
| `Summary` | Text | Score summary or enquiry summary |
| `Recommendation` | Text | Next-step recommendation or enquiry message |
| `Reference` | Text | Unique UUID submission reference |
| `Submitted At` | Date/Time (or Text) | Written as epoch ms, with automatic ISO fallback |
| `Status` | Text / Single Select | Initialized to `"New"` |
| `Source` | Text | e.g. `"Financial Clarity Assessment"`, `"Lekki Avana Signature"`, `"PalmVille"`, `"Investment Guide Consultation"` |

**Optional CRM columns for property & consultation enquiries (5 columns):**

| Column name | Recommended Lark field type | Notes |
|---|---|---|
| `Phone` | Text | Visitor phone / WhatsApp number |
| `Plot Size` | Text | Selected plot size or Investment Guide strategy |
| `Payment Plan` | Text | Selected payment plan |
| `Message` | Text | Free-text enquiry / consultation notes |
| `Traffic Source` | Text | Landing page / UTM attribution |

If any optional columns (`Phone`, `Plot Size`, `Payment Plan`, `Message`, `Traffic Source`) have not been created in the live `Assessment Leads` table yet—or reject field conversion—`src/lib/lark-base.ts` automatically folds those values into `Summary` and `Recommendation` and retries with the core 9-column schema so enquiries are never dropped (while preserving real `401`/`403` auth/permission errors).

Create the Vercel Blob store under the owner’s account. Do not reuse a token from another account without explicitly transferring ownership and rotating it.

## Updating videos and consultation calendar URLs

See **`docs/handoff/HOW-TO-UPDATE-VIDEOS.md`** for step-by-step instructions on replacing hosted property/walkthrough video URLs and updating Google Calendar / consultation booking links across the site.

## DNS and domain checklist

- Add the domain in Vercel.
- Apply the DNS records Vercel provides at the registrar.
- Choose either `www.9jawealth.com` or `9jawealth.com` as canonical.
- Redirect the other hostname to the canonical hostname.
- Confirm the SSL certificate is active.
- Confirm the canonical and Open Graph URLs in `index.html` match the final hostname.

### `www` Vercel DNS record

At the external DNS provider (WhoGoHost), replace any existing `www` CNAME
that points to `9jawealth.com` with:

```text
Type:  CNAME
Host:  www
Value: 839b90a0fee59a2f.vercel-dns-017.com
TTL:   Auto (or 3600)
```

After DNS propagation, add and verify `www.9jawealth.com` in the `9jawealth`
Vercel project. Until then, the working production URL is
`https://9jawealth.com`.

## Verification checklist

Run locally before the production transfer:

```bash
npm ci
npm run verify:all
```

If deploying the optional legacy `moneymarkets` app separately:

```bash
cd moneymarkets
npm ci
npm run lint
npm run build
```

Then verify on the owner’s Vercel preview and production URLs:

- Main page loads without console errors and has no Forex links on the homepage.
- Desktop and mobile navigation work (including `/education.html`, `/guide`, `/education`, and `/investment-guide`).
- Assessment completes through all 31 questions.
- Each result bracket renders correctly.
- Invalid or missing form values are rejected by the browser.
- A real submission reaches the configured mailbox and creates a record in Lark Base (`Assessment Leads`).
- Consultation booking (`Investment Guide Consultation`) and property enquiry forms (`Signature` and `PalmVille`) capture to Lark Base and trigger Resend notifications.
- The API returns an assessment/enquiry reference.
- The Blob backup is created in the owner’s store.
- Lekki Avana Signature, PalmVille, `/education.html` Investment Guide, WhatsApp, Instagram, and LinkedIn links work.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/manifest.webmanifest` load.
- No environment secret appears in the browser bundle or repository.

## Current known blockers before calling this production-ready

All Stage-1 blockers below were resolved in the hardening pass (server-recomputed
results, escaped email HTML, strict validation, allowlisted CORS, per-IP rate
limiting + honeypot + dwell-time check, redacted Blob backups, `api/` included
in `tsc`, quiz back-navigation + localStorage resume, code-split below-fold
sections, non-blocking fonts, CI workflow, Lark Base lead-first persistence &
schema-fallback resilience, and consultation-booking CRM capture). Remaining owner actions:

- Front `/api/send-report` with Vercel Firewall / KV-backed rate limits and add
  Turnstile before high-traffic launch (in-instance limiting is best-effort on
  serverless). Set `ALLOWED_ORIGINS` in production.
- Verify `9jawealth.com` in Resend (`docs/handoff/RESEND-DNS-RECORDS.txt`) and
  set the real `LARK_APP_SECRET` from the Lark Developer Console in Vercel.
- Blob backups store **no raw email** (hash + masked form only) because the
  installed `@vercel/blob` SDK supports public objects only. For stricter needs,
  set `BLOB_ENABLED=false` or migrate to private storage on SDK upgrade.
- If the optional standalone `moneymarkets/` app is deployed separately, note
  that its course gate is a frontend mock and must not be treated as paid-content security.

## Repository handoff rules

- Transfer the repository or push the clean release branch to the owner’s organization.
- Do not transfer `node_modules/`, `dist/`, `.vercel/`, or `.env` files.
- Keep `.env.example` as documentation only.
- Tag the exact release deployed to Vercel, for example `handoff-2026-08-07`.
- Record the deployed Vercel project URL and commit SHA in the owner’s operations notes.
- After the owner confirms access, remove any temporary credentials and reduce collaborator access to the minimum required level.

## Deployment matrix

Deploy each active product as its own Vercel project under the owner account:

| Product | Root directory | Build command | Output | Suggested domain |
|---|---|---|---|---|
| Main 9jawealth assessment + `/education.html` guide | `/` | `npm run build` | `dist` | `www.9jawealth.com` |
| Lekki Avana Signature | `/lekki-avana-signature` | No build command | Static files | `signature.9jawealth.com` |
| PalmVille | `/palmville` | No build command | Static files | `palmville.9jawealth.com` |
| Salaryman | `/salaryman` | No build command | Static files | `salaryman.9jawealth.com` |
| Money Markets *(optional/legacy, removed from homepage)* | `/moneymarkets` | `npm run build` | `dist` | `forex.9jawealth.com` |

PalmVille, Lekki Avana Signature, and Salaryman are static multi-page sites with local assets and `/api/send-report` CRM integration (with FormSubmit fallback where configured). PalmVille and Lekki Avana Signature keep all interactive JavaScript in external `app.js` files under strict Content-Security-Policy (`no 'unsafe-inline'` scripts); legacy `lekki-avana-signature/lekki-avana-signature.html` has been removed, and `public/palmville/` stays synced with `palmville/`. See `docs/handoff/HOW-TO-UPDATE-VIDEOS.md` for updating externally hosted video and calendar URLs before launch. Each product requires its own domain mapping, content review, and ownership check.

## Stage 1 completion criteria

Stage 1 is complete when the owner has:

- A clean repository or release branch identified for the active products.
- A Vercel project created under the owner’s account.
- Production secrets entered directly into Vercel.
- Domain ownership and DNS access confirmed.
- A successful preview deployment.
- An agreed list of blockers that must be resolved before public launch.

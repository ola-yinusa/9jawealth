# 9jawealth Owner → Vercel Handoff

## Purpose

This document is the Stage 1 handoff for the complete 9jawealth monorepo: the root Vite/React assessment, Money Markets, PalmVille, and Salaryman. It is written for the owner who will create and control the production Vercel projects, domains, email credentials, storage accounts, and external service accounts.

All four products are included in the source handoff and should be deployed as separate Vercel projects so each product can have its own root directory, domain, and release lifecycle.

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

The site presents a financial clarity assessment with 31 questions. The first 26 questions determine one of four result brackets. After completion, the visitor can submit a name and email address. The server function sends the result through GO54 Cloud Mail SMTP and attempts to store a JSON backup in Vercel Blob.

The site also contains a WhatsApp CTA, social links, an About section, and a gold-trading destination at `https://forex.9jawealth.com`.

## Owner-controlled services

The owner should create or control all of the following:

- GitHub repository or equivalent source repository
- Vercel team and production project
- `9jawealth.com` domain and DNS
- GO54/WhoGoHost mailbox used for assessment delivery
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
9. Add `www.9jawealth.com` and the preferred apex-domain redirect.
10. Verify the assessment submission on the production domain.

## Required production environment variables

Configure these in Vercel Project Settings → Environment Variables. Add them to Production, and to Preview only if preview email delivery is intentionally enabled.

```text
WHOGOHOST_SMTP_HOST=smtp.go54mail.com
WHOGOHOST_SMTP_PORT=587
WHOGOHOST_SMTP_USER=assessment@9jawealth.com
WHOGOHOST_SMTP_PASSWORD=<owner-provided mailbox password>
WHOGOHOST_MAIL_FROM=9jawealth <assessment@9jawealth.com>
WHOGOHOST_REPLY_TO=hello@9jawealth.com
BLOB_READ_WRITE_TOKEN=<owner-created Vercel Blob token>
```

Create the Vercel Blob store under the owner’s account. Do not reuse a token from another account without explicitly transferring ownership and rotating it.

## DNS and domain checklist

- Add the domain in Vercel.
- Apply the DNS records Vercel provides at the registrar.
- Choose either `www.9jawealth.com` or `9jawealth.com` as canonical.
- Redirect the other hostname to the canonical hostname.
- Confirm the SSL certificate is active.
- Confirm the canonical and Open Graph URLs in `index.html` match the final hostname.

## Verification checklist

Run locally before the production transfer:

```bash
npm ci
npm run verify:all
```

For the nested app alone:

```bash
cd moneymarkets
npm ci
npm run lint
npm run build
```


Then verify on the owner’s Vercel preview and production URLs:

- Main page loads without console errors.
- Desktop and mobile navigation work.
- Assessment completes through all 31 questions.
- Each result bracket renders correctly.
- Invalid or missing form values are rejected by the browser.
- A real submission reaches the configured mailbox.
- The API returns an assessment reference.
- The Blob backup is created in the owner’s store.
- WhatsApp, Instagram, LinkedIn, and gold-trading links work.
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/manifest.webmanifest` load.
- No environment secret appears in the browser bundle or repository.

## Current known blockers before calling this production-ready

- The assessment API trusts client-provided result fields and needs stronger runtime validation.
- User-controlled values are interpolated directly into the HTML email and should be escaped before production use.
- Assessment backups are currently written as public Vercel Blob objects; this should be reviewed because submissions contain personal data.
- There is no visible rate limiting or abuse protection on `/api/send-report`.
- The main page says it has two wealth paths, but the React content currently exposes only the gold-trading path. Real estate is marked as coming soon.
- The Money Markets course gate is a frontend mock and must not be treated as paid-content security.

## Repository handoff rules

- Transfer the repository or push the clean release branch to the owner’s organization.
- Do not transfer `node_modules/`, `dist/`, `.vercel/`, or `.env` files.
- Keep `.env.example` as documentation only.
- Tag the exact release deployed to Vercel, for example `handoff-2026-08-07`.
- Record the deployed Vercel project URL and commit SHA in the owner’s operations notes.
- After the owner confirms access, remove any temporary credentials and reduce collaborator access to the minimum required level.

## Deployment matrix

Deploy each product as its own Vercel project under the owner account:

| Product | Root directory | Build command | Output | Suggested domain |
|---|---|---|---|---|
| Main 9jawealth assessment | `/` | `npm run build` | `dist` | `www.9jawealth.com` |
| Money Markets | `/moneymarkets` | `npm run build` | `dist` | `forex.9jawealth.com` |
| PalmVille | `/palmville` | No build command | Static files | `palmville.9jawealth.com` |
| Salaryman | `/salaryman` | No build command | Static files | `salaryman.9jawealth.com` |

Money Markets exposes `/` and `/course`. PalmVille and Salaryman are static multi-page sites with local assets and external form or payment destinations. Review the duplicate top-level snapshot files before choosing whether to deploy them. Each product requires its own domain mapping, content review, and ownership check.

## Stage 1 completion criteria

Stage 1 is complete when the owner has:

- A clean repository or release branch identified for all four products.
- A Vercel project created under the owner’s account.
- Production secrets entered directly into Vercel.
- Domain ownership and DNS access confirmed.
- A successful preview deployment.
- An agreed list of blockers that must be resolved before public launch.

# 9jawealth Frontend

Frontend landing page for 9jawealth, built with React, Vite, Tailwind CSS, and Motion.

## Run locally

Prerequisite: Node.js

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`

## Notes

- Assessment submissions are sent through Resend SMTP from the server-side `/api/send-report` function. A separate owner notification is sent to `RESEND_NOTIFY_TO` with Reply-To set to the visitor, so replies from Lark go directly back to the lead.
- Valid assessment submissions are also captured in the `Assessment Leads` table in the `9jawealth Leads` Lark Base. Only contact details, the server-calculated result, reference, timestamp, status, and source are stored; the full answer set remains out of Lark Base.
- Store the Resend SMTP credentials in deployment environment variables; never expose them in the frontend.
- Store the Lark app credentials and Base identifiers in server-only environment variables; never expose them in the frontend.

## Repository layout

This repository is a monorepo containing four independently deployable products:

- Root 9jawealth assessment: the main Vite/React app and `/api/send-report`.
- `moneymarkets/`: React app with `/` and `/course` routes.
- `palmville/`: static PalmVille landing page. Its large video is intentionally hosted outside GitHub; set `PALMVILLE_VIDEO_URL` in `palmville/index.html` before launch.
- `salaryman/`: static Salary-to-Zero sales funnel and product assets.

## Verification

Run the complete local check with:

```bash
npm run verify:all
```

The root app requires the Resend SMTP, Lark Base, and Vercel Blob variables listed in `.env.example` only when the submission API is exercised. Lark capture is best-effort after email delivery; a Lark API failure is logged with the submission reference without exposing credentials.

## Vercel projects

Deploy each product as a separate Vercel project. Use the root directory, build command, output directory, and suggested domain in `docs/handoff/OWNER-VERCEL-HANDOFF.md`.

The owner should create the projects and environment variables in their own Vercel account.

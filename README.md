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

- Assessment submissions are sent through WhoGoHost GO54 Cloud Mail SMTP from the server-side `/api/send-report` function.
- Store the SMTP credentials in deployment environment variables; never expose them in the frontend.

## Repository layout

This repository is a monorepo containing four independently deployable products:

- Root 9jawealth assessment: the main Vite/React app and `/api/send-report`.
- `moneymarkets/`: React app with `/` and `/course` routes.
- `palmville/`: static PalmVille landing page and local video assets.
- `salaryman/`: static Salary-to-Zero sales funnel and product assets.

## Verification

Run the complete local check with:

```bash
npm run verify:all
```

The root app requires the SMTP and Vercel Blob variables listed in `.env.example` only when the submission API is exercised.

## Vercel projects

Deploy each product as a separate Vercel project. Use the root directory, build command, output directory, and suggested domain in `docs/handoff/OWNER-VERCEL-HANDOFF.md`.

The owner should create the projects and environment variables in their own Vercel account.

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

# 9jawealth Frontpage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the 9jawealth frontend into a trust-first, premium, interactive landing page with honest frontend-only flows, stronger accessibility, and better SEO foundations.

**Architecture:** Keep the app as a Vite single-page React experience, but extract content and quiz logic into focused modules. Use a light-first editorial visual system with shared layout patterns, accessible overlays, and animation that respects reduced motion.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion

---

### Task 1: Establish shared content and theme foundations

**Files:**
- Create: `src/content/site.ts`
- Modify: `src/index.css`
- Modify: `src/App.tsx`

- [ ] Extract site-wide nav, proof, and CTA content into `src/content/site.ts`.
- [ ] Expand the global theme tokens in `src/index.css` for premium light-first surfaces, dark accents, shadows, and motion variables.
- [ ] Add semantic root structure in `src/App.tsx`, including a stronger page background and skip-link integration.

### Task 2: Rebuild core sections for premium editorial presentation

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/Pillars.tsx`
- Modify: `src/components/MeetOla.tsx`
- Modify: `src/components/SocialProof.tsx`
- Modify: `src/components/Paths.tsx`

- [ ] Rework hero composition, hierarchy, trust cues, and responsive behavior.
- [ ] Upgrade supporting sections so they feel more intentionally designed and less template-like.
- [ ] Keep all external actions clear and consistent while avoiding dead-end presentation.

### Task 3: Refactor quiz for extensibility and honest frontend-only behavior

**Files:**
- Create: `src/content/quiz.ts`
- Create: `src/lib/quiz.ts`
- Modify: `src/components/Quiz.tsx`

- [ ] Extract quiz data into `src/content/quiz.ts`.
- [ ] Move score/result derivation into `src/lib/quiz.ts`.
- [ ] Rebuild `src/components/Quiz.tsx` as a guided assessment with transparent “preview” messaging instead of fake delivery claims.

### Task 4: Harden overlays, footer, and interaction states

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Popup.tsx`
- Modify: `src/components/WhatsApp.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] Make mobile navigation and popup interactions accessible and keyboard-friendly.
- [ ] Improve focus states, labels, dismissal behavior, and overlay semantics.
- [ ] Replace placeholder/dead-end messaging with clearer frontend-safe UX.

### Task 5: Upgrade metadata and SEO-facing frontend structure

**Files:**
- Modify: `index.html`
- Create: `public/manifest.webmanifest`
- Optional create: `public/robots.txt`

- [ ] Add stronger title, description, social metadata, canonical-friendly frontend metadata, and theme color support.
- [ ] Add organization-oriented structured data for the landing page.
- [ ] Include basic crawler-facing assets that are appropriate for a frontend-only marketing page.

### Task 6: Verify quality and run SEO pass

**Files:**
- Modify as needed from findings

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start a local preview server if needed for audit.
- [ ] Run an SEO-focused audit and address the highest-value frontend findings.

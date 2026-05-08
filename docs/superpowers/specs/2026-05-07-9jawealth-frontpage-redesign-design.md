# 9jawealth Frontpage Redesign Design

## Goal

Redesign the frontend-only 9jawealth landing page into a premium, trust-first financial experience that feels editorial, interactive, and credible while staying honest about the lack of backend wiring.

## Experience Direction

The page should feel like a refined financial editorial experience rather than a generic fintech landing page. The visual system will be light-first with dark structural accents, warm neutrals, selective gold emphasis, and high-quality typography. Motion should be present, but never loud. The strongest impression should be confidence and care.

## Product Constraints

- Frontend only. No backend submission, report delivery, or CRM integration in this pass.
- Existing destinations for forex and real-estate links may remain external.
- Placeholder flows must be visually honest and clearly framed as previews where backend functionality is not available.
- Accessibility and SEO are first-class requirements.

## Design Changes

### Global visual system

- Expand the design tokens to support warmer neutrals, ink tones, accent washes, fluid spacing, and premium shadows.
- Introduce more deliberate typography hierarchy and section rhythm.
- Upgrade page backgrounds from flat fills to layered tonal compositions.
- Standardize focus states and component interaction styles.

### Information architecture

- Reframe the page around trust, clarity, proof, and next steps.
- Keep the current section order broadly intact, but improve transitions and content hierarchy so the page reads as a guided journey.
- Make “frontend-only preview” messaging explicit in the quiz/report flow rather than pretending success.

### Hero

- Make the hero feel more editorial and less template-like.
- Emphasize the assessment as a clarity tool, not hype.
- Add richer supporting signals such as trust copy and premium image treatment while preserving strong accessibility and readable contrast.

### Quiz

- Refactor quiz content, scoring logic, and UI flow into clearer boundaries.
- Present questions as a guided assessment with better context, progress, answer feedback, and a more polished reveal flow.
- Replace fake “email sent” behavior with an honest preview state that explains the report flow is a frontend demonstration.

### Proof and conversion sections

- Improve visual hierarchy and distinctiveness in pillars, social proof, and path cards.
- Make CTAs feel intentional and consistent.
- Remove or reframe dead-end actions.

### Overlay interactions

- Upgrade mobile navigation and popup interactions to be accessible, keyboard-friendly, and visually cohesive.
- Respect reduced motion and visible focus at every layer.

## Technical Refactor

### Content extraction

- Move repeated marketing content, nav items, and quiz data into reusable data/config modules.
- Prepare the codebase for future CMS or API wiring by reducing copy embedded directly inside components.

### Shared UI primitives

- Introduce reusable section wrappers and action patterns where it reduces duplication.
- Keep the codebase lean; do not introduce a heavy component system for a small marketing site.

### Quiz boundaries

- Separate quiz question data, score derivation, and presentational rendering.
- Preserve current frontend-only scope while creating a clean seam for future submission wiring.

## Accessibility

- Add proper labels, helper text, and semantic grouping for forms.
- Improve modal and drawer semantics, keyboard dismissal, and focus treatment.
- Ensure hover-only affordances have non-hover equivalents.
- Add reduced-motion handling for global and component-level animation.

## SEO

- Improve document metadata, social metadata, and semantic sectioning.
- Strengthen heading structure and internal link clarity.
- Add structured data suitable for a finance/brand landing page on the frontend.
- Ensure crawlable, honest content that reflects the current product state.

## Verification

- Run `npm run lint` and `npm run build`.
- Run an SEO-focused audit against the built frontend if a local preview server is available.
- Manually confirm no fake-success messaging remains in the lead capture flow.

# PRD — Signature Subdomain Price & Payment Plan Update
**Site:** `https://signature.9jawealth.com/` (Lekki Avana Signature)
**Code entry point:** `lekki-avana-signature/index.html`
**Date issued:** 2026-10-06
**Status:** Awaiting new price / payment-plan copy

## 1. Objective
Collect a single verified copy of the **new prices and payment plans** so the signature subdomain can be updated in one pass without mismatched figures across sections.

Share this doc with whoever holds the current Zylus schedule. They only need to fill in **Section 4**.

## 2. Scope
In scope:
- Plot prices, deposits, monthly instalments, totals (6-month / 12-month / outright if any)
- Physical allocation thresholds (currently ₦3M / ₦5M / ₦7M)
- Fees included vs. excluded (survey, legal, development, infrastructure)
- Penalties / refund terms if changed (currently 5% monthly on overdue, 35% admin deduction on certain refunds)
- Source document + checked date (currently acquisition form checked 29 Sept 2026)
- Linked photos / video if they change with this price release

Out of scope (separate request):
- Form recipient, WhatsApp number, SEO, layout redesign

## 3. Current live values (for reference — do not edit)
Source: `lekki-avana-signature/index.html` + README, checked 29 Sept 2026.

| Plot | Initial deposit | 6-month plan (monthly / total) | 12-month plan (monthly / total) |
|---|---|---|---|
| 300 SQM | ₦1,000,000 | ₦2,533,333 / mo — ₦16,200,000 total | ₦1,433,333 / mo — ₦18,200,000 total |
| 500 SQM | ₦1,000,000 | ₦4,333,333 / mo — ₦27,000,000 total | ₦2,333,333 / mo — ₦29,000,000 total |
| 1000 SQM | ₦5,000,000 | ₦10,000,000 / mo — ₦65,000,000 total | ₦5,416,667 / mo — ₦70,000,000 total |

- Hero stat starting price: **₦16.2M**
- Allocation thresholds: 300 SQM → ₦3,000,000; 500 SQM → ₦5,000,000; 1000 SQM → ₦7,000,000
- Table note: figures include survey, legal and preliminary development fees; separate infrastructure fee applies before construction; 5% monthly charge on overdue; 35% admin deduction on certain refunds.
- Source links: `https://www.zylushomes.com/house/lekki-avana-signature` and `.../lekki-avana-signature-form.pdf`

These figures appear in **5 synced places**: hero stats, 3× plot showcase cards, pricing table, VIP allocation card, table footnote + JSON-LD `dateModified`. All must be updated together.

## 4. NEW COPY — fill this in and send back <<<

### 4a. New payment table (required)
> Replace every cell. Write "UNCHANGED" if a row stays the same. Totals must equal deposit + instalments — show the maths.

| Plot | Initial deposit | 6-month plan (monthly / total) | 12-month plan (monthly / total) | Outright 0–3 mo (if any) |
|---|---|---|---|---|
| 300 SQM | ₦ | ₦ / mo — ₦ total | ₦ / mo — ₦ total | ₦ |
| 500 SQM | ₦ | ₦ / mo — ₦ total | ₦ / mo — ₦ total | ₦ |
| 1000 SQM | ₦ | ₦ / mo — ₦ total | ₦ / mo — ₦ total | ₦ |

### 4b. Allocation thresholds (required)
- 300 SQM physically allocated at ₦________
- 500 SQM physically allocated at ₦________
- 1000 SQM physically allocated at ₦________
- Full possession condition: ________

### 4c. Fees & terms (required)
- Included in totals: [ ] survey [ ] legal [ ] preliminary development [ ] other: ________
- Infrastructure fee: ₦________ — due when? ________
- Overdue charge: ________ (currently 5% monthly)
- Refund / admin deduction: ________ (currently 35% on certain refunds, payable within 6 months)
- Any new 300 / 500 / 1000 SQM sizes added or removed? ________

### 4d. Source of truth (required)
- Source document name + URL/PDF: ________
- Checked date (to print on page, e.g. "checked 6 Oct 2026"): ________
- Contact for verification: ________

### 4e. Headline / copy changes (optional)
- Hero headline stays "Land for the home you're planning"? Y / N → new: ________
- Plot card text changes? ________
- VIP card headline changes? ________

### 4f. Photos / video (only if changing)
Current: hero video `drive.google.com/file/d/1zh_fn1v0lP_-ZI-nk3yQnEGHeukXudfp`, hero + 6 gallery images (`site-progress.webp`, `images/site-progress-2…6.webp`), 6 project cards (`images/project-1…6.webp`).
- Replace which slot with what file/link? ________
- New files attached? Y / N — filenames: ________

### 4g. Sign-off
- Approved by (name): ________
- Date: ________
- "Publish on approval"? Y / N

---

## 5. Acceptance criteria (dev side)
1. Pricing table, plot cards, hero starting price, VIP card, footnote, and JSON-LD `dateModified` all match Section 4.
2. Canonical / OG URLs stay `https://signature.9jawealth.com/`; no layout break at 360px / 768px / 1280px.
3. `robots.txt` / `sitemap.xml` untouched unless URL changes.

## 6. How to return this
Reply with this doc filled in, or paste just Section 4 in chat/WhatsApp + attach the source PDF. One complete submission = one deploy.

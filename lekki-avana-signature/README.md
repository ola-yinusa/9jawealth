# Lekki Avana Signature

This folder is the standalone static site for `signature.9jawealth.com`. The separate `lekki-avana-signature.html` file is the older Elementor widget version and is not the Vercel entry point.

For Vercel, set the project root directory to `lekki-avana-signature`, choose **Other** as the framework, and leave the build command and output directory unset. Deploy the folder directly so `index.html`, `robots.txt`, `sitemap.xml`, and the local image files keep their expected root URLs.

The original 300, 500, and 1000 SQM video embeds were removed from the standalone page because their thumbnails assert “C of O” while the developer's documents conflict on title wording. Use corrected media only after the title wording is verified with the estate owner. The site overview video remains available from the hero.

The developer's [property listing](https://www.zylushomes.com/house/lekki-avana-signature) and [acquisition form](https://www.zylushomes.com/house/lekki-avana-signature/lekki-avana-signature-form.pdf) use different title descriptions. The page asks buyers to request the current title documents without characterizing the title. Do not resolve this discrepancy in copy without those documents. The standalone page has no FAQ section or FAQ structured data.

The enquiry form posts through FormSubmit to the 9jawealth contact address configured in `index.html`. JavaScript uses FormSubmit's AJAX endpoint to show success or failure on the page; the native POST remains as a fallback. The recipient must activate the address from FormSubmit's confirmation email after the first submission. Delivery has not yet been verified. Do not assume that an AJAX success response confirms inbox receipt. The page also offers a direct WhatsApp route.

Site photos have no verified dates, so the page labels them as estate materials and asks visitors to request dated updates or inspect the site. The listed prices are from the developer's acquisition form checked on 29 September 2026; buyers should request the current written schedule. The production canonical URL is `https://signature.9jawealth.com/`; preview deployments are for review and are not expected to appear in search results.

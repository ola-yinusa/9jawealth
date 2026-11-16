import { ArrowRight, ArrowUpRight, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { footerLinks, socialLinks } from "@/src/content/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy pt-20 text-white">
      <div className="section-shell grid grid-cols-1 gap-12 border-b border-white/12 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="font-serif text-2xl italic text-gold-light">₦</span>
            <span className="font-serif text-2xl font-bold text-white">9jawealth</span>
          </div>
          <p className="mb-8 max-w-sm text-[15px] leading-relaxed text-white/78">
            Financial self-assessment, private wealth education, and vetted Nigerian residential and agro-real estate pathways.
          </p>
          <div className="flex gap-3">
            {socialLinks.map((social) => {
              const Icon = social.label === "Instagram" ? Instagram : social.label === "LinkedIn" ? Linkedin : MessageCircle;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="focus-ring-dark flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-white hover:border-gold-light hover:text-gold-light"
                >
                  <Icon size={18} strokeWidth={1.75} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-6 font-display text-[13px] font-bold uppercase tracking-[0.2em] text-gold-light">
            Navigate
          </h3>
          <ul className="space-y-2">
            {footerLinks.navigation.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="focus-ring-dark inline-flex min-h-11 items-center text-sm text-white/80 hover:text-gold-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-6 font-display text-[13px] font-bold uppercase tracking-[0.2em] text-gold-light">
            Next steps
          </h3>
          <div className="flex flex-col items-start gap-3">
            {footerLinks.connect.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="focus-ring-dark inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/88 hover:border-gold-light hover:text-gold-light"
              >
                <span>{link.label}</span>
                {link.external ? (
                  <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
                )}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 font-display text-[13px] font-bold uppercase tracking-[0.2em] text-gold-light">
            Important information
          </h3>
          <ul className="mb-5 space-y-2">
            {footerLinks.legal.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="focus-ring-dark inline-flex min-h-11 items-center text-sm text-white/80 hover:text-gold-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-white/70">
            Content here is informational and educational. Real estate and wealth decisions carry risk and should follow independent review.
          </p>
        </div>
      </div>

      <div className="section-shell py-10">
        <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-2">
          <section id="privacy" aria-labelledby="footer-privacy-heading" className="scroll-mt-24">
            <h3 id="footer-privacy-heading" className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">
              Privacy notice
            </h3>
            <p className="max-w-[56ch] text-sm leading-relaxed text-white/78">
              Details entered in the financial clarity assessment or consultation form are used solely to deliver your diagnostic summary and coordinate any follow-up you request. Your information is never sold or shared with third-party advertisers.
            </p>
          </section>

          <section id="terms" aria-labelledby="footer-terms-heading" className="scroll-mt-24">
            <h3 id="footer-terms-heading" className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.16em] text-gold-light">
              Terms of use
            </h3>
            <p className="max-w-[56ch] text-sm leading-relaxed text-white/78">
              Educational guides, diagnostic brackets, and property highlights on 9jawealth are provided for general guidance and do not constitute personalized financial, tax, or legal advice.
            </p>
          </section>
        </div>

        <p className="pt-6 text-[13px] text-white/68">
          © {currentYear} 9jawealth. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

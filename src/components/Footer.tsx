import { ArrowUpRight, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { footerLinks, socialLinks } from "@/src/content/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy pt-20">
      <div className="section-shell grid grid-cols-1 gap-12 border-b border-white/8 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl font-serif italic text-gold">₦</span>
            <span className="text-2xl font-serif font-bold text-white">9jawealth</span>
          </div>
          <p className="mb-8 max-w-sm text-[15px] leading-relaxed text-white/58">
            A trust-first experience for financial self-assessment, disciplined opportunity, and long-view wealth conversations.
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
                  className="focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/12 text-white hover:border-gold hover:text-gold"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-[13px] font-bold uppercase tracking-[0.2em] text-gold">Navigate</h4>
          <ul className="space-y-4">
            {footerLinks.navigation.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="focus-ring inline-flex min-h-11 items-center text-sm text-white/62 hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-[13px] font-bold uppercase tracking-[0.2em] text-gold">Next steps</h4>
          <div className="flex flex-col gap-3 items-start">
            {footerLinks.connect.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 px-4 py-3 text-sm text-white/82 hover:border-gold hover:text-gold"
              >
                {link.label}
                <ArrowUpRight size={15} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-[13px] font-bold uppercase tracking-[0.2em] text-gold">Frontend notes</h4>
          <ul className="mb-6 space-y-4">
            {footerLinks.legal.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="focus-ring inline-flex min-h-11 items-center text-sm text-white/62 hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[11px] leading-relaxed italic text-white/34">
            Money-markets guidance is informational only. Trading and investment decisions involve risk and should be approached with independent judgment.
          </p>
        </div>
      </div>

      <div className="section-shell py-8">
        <p className="text-[13px] text-white/30">
          © {currentYear} 9jawealth. All rights reserved.
        </p>
        <div className="sr-only">
          <section id="privacy" aria-label="Privacy notice">
            Assessment requests are captured for follow-up and review.
          </section>
          <section id="terms" aria-label="Terms">
            Financial content presented here is informational and not personalized financial advice.
          </section>
        </div>
      </div>
    </footer>
  );
}

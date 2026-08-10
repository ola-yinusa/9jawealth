import { siteConfig } from "@/src/content/site";
import { Check } from "lucide-react";

export default function SignalOffer() {
  const features = [
    "Weekly trade signals with precise entry, SL, and TP",
    "Detailed rationale explaining why we took the trade",
    "Private Telegram community access",
    "Beginner guidance and demo trading support",
    "Strict risk management framework included",
  ];

  return (
    <section id="plans" className="py-24">
      <div className="section-shell">
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            <div className="p-10 md:p-14 lg:p-16 border-b md:border-b-0 md:border-r border-white/5">
              <span className="eyebrow mb-4 block">The Entry Point</span>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
                Signal Membership
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Start your journey with guided, high-probability trade setups. We don't just tell you what to trade; we explain why, so you learn the market structure over time.
              </p>

              <ul className="space-y-4 mb-10">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex shrink-0 h-5 w-5 items-center justify-center rounded-full bg-gold/10 text-gold-light">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="text-[15px] text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center bg-surface/30">
              <div className="mb-8">
                <p className="text-sm text-gold-light font-display uppercase tracking-wider font-semibold mb-2">Monthly Subscription</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-serif text-white">₦10,000</span>
                  <span className="text-white/40">/mo</span>
                </div>
                <p className="mt-3 text-sm text-white/50">Approximately $10/month. Cancel anytime.</p>
              </div>

              <div className="space-y-4">
                <a
                  href={siteConfig.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring flex min-h-14 items-center justify-center rounded-full bg-gold text-void font-display text-[15px] font-semibold tracking-wide hover:bg-gold-light transition-colors"
                >
                  Pay via Telegram
                </a>
                <p className="text-center text-[13px] text-white/40">
                  Payments are currently handled manually via our secure Telegram support channel.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white mb-1">New to trading?</p>
                <p className="text-[13px] text-white/60">
                  Ask about our 2-week free trial when you message us on Telegram. We prefer you test our methodology on a demo account first.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

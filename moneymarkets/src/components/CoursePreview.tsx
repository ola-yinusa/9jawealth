import { siteConfig } from "@/src/content/site";

export default function CoursePreview() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="eyebrow inline-block mb-4">The Complete System</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            The Masterclass
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            For those who want to move beyond signals and learn to read the market themselves. This is our comprehensive A-to-Z trading curriculum.
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 md:p-12 border border-gold/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[50px] rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-serif text-gold-light mb-4">What's Inside</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-white/80">
                  <span className="text-gold mt-1">•</span>
                  <span>Market structure and institutional price action</span>
                </li>
                <li className="flex gap-3 text-white/80">
                  <span className="text-gold mt-1">•</span>
                  <span>Advanced liquidity concepts and entry models</span>
                </li>
                <li className="flex gap-3 text-white/80">
                  <span className="text-gold mt-1">•</span>
                  <span>Psychology, emotional control, and trade journaling</span>
                </li>
                <li className="flex gap-3 text-white/80">
                  <span className="text-gold mt-1">•</span>
                  <span>Lifetime access to the VIP community</span>
                </li>
              </ul>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-serif text-white">₦200,000</span>
                <span className="text-white/40 text-sm">One-time payment</span>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 bg-surface/50 rounded-2xl p-6 border border-white/5 text-center">
              <h4 className="text-white font-semibold mb-2">Ready to master the skill?</h4>
              <p className="text-[13px] text-white/50 mb-6 max-w-xs">
                Message us on Telegram to purchase. Once confirmed, you'll receive an access code for the private course portal.
              </p>
              <a
                href={siteConfig.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring block w-full rounded-full bg-gold px-6 py-3 font-display text-[14px] font-bold text-void hover:bg-gold-light transition-colors"
              >
                Purchase via Telegram
              </a>
              <div className="mt-4 pt-4 border-t border-white/5">
                <a href="/course" className="text-[13px] text-gold-light hover:underline underline-offset-4">
                  Already have a code? Login here →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

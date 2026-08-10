import { siteConfig } from "@/src/content/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-void pt-16 pb-8">
      <div className="section-shell">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start mb-16">

          <div className="text-center md:text-left max-w-sm">
            <a href={siteConfig.parentSite} className="inline-block mb-4">
              <span className="text-xl font-serif font-semibold text-gold">₦</span>
              <span className="text-lg font-serif tracking-tight text-white ml-2">9jawealth</span>
            </a>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Discipline. Structure. Consistency.
              The foundation of sustainable wealth in the money markets.
            </p>
          </div>

          <div className="flex gap-8 text-[13px]">
            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white">Platform</span>
              <a href={siteConfig.parentSite} className="text-white/50 hover:text-white transition-colors">9jawealth Main</a>
              <a href="#plans" className="text-white/50 hover:text-white transition-colors">Signal Plans</a>
              <a href="/course" className="text-white/50 hover:text-white transition-colors">Course Login</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-white">Connect</span>
              <a href={siteConfig.telegramLink} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-gold-light transition-colors">Telegram Support</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-[11px] text-white/30 space-y-4">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong>HIGH RISK WARNING:</strong> Foreign exchange trading carries a high level of risk that may not be suitable for all investors.
            Leverage creates additional risk and loss exposure. Before you decide to trade foreign exchange, carefully consider your investment
            objectives, experience level, and risk tolerance. You could lose some or all of your initial investment. Do not invest money that
            you cannot afford to lose. Educate yourself on the risks associated with foreign exchange trading, and seek advice from an independent
            financial or tax advisor if you have any questions. 9jawealth is an educational and signal service, not a registered financial advisor.
          </p>
          <p>
            &copy; {currentYear} 9jawealth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useState } from "react";
import { siteConfig } from "@/src/content/site";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/5 bg-void/80 py-4 backdrop-blur-xl shadow-elevated"
          : "bg-transparent py-6"
      }`}
    >
      <nav aria-label="Primary" className="section-shell flex items-center justify-between">
        <a href={siteConfig.parentSite} className="focus-ring group flex items-center gap-2 rounded-full py-1">
          <span className="text-2xl font-serif font-semibold text-gold transition-colors group-hover:text-gold-light">
            ₦
          </span>
          <span className={`text-xl font-serif tracking-tight transition-colors duration-300 text-white`}>
            9jawealth <span className="text-white/40">|</span> Forex
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href={siteConfig.parentSite} className="focus-ring text-sm text-white/60 hover:text-white transition-colors">Back to Main Site</a>
          <a href="#philosophy" className="focus-ring text-sm text-white/60 hover:text-white transition-colors">Philosophy</a>
          <a href="#plans" className="focus-ring text-sm text-white/60 hover:text-white transition-colors">Plans</a>
          <a href="#proof" className="focus-ring text-sm text-white/60 hover:text-white transition-colors">Track Record</a>

          <a
            href={siteConfig.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-full border border-gold/30 bg-gold/10 px-5 py-2 font-display text-[13px] font-semibold text-gold-light hover:bg-gold hover:text-void transition-colors"
          >
            Join Telegram
          </a>
        </div>
      </nav>
    </header>
  );
}

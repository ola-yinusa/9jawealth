import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { navItems } from "@/src/content/site";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeMenu);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeMenu);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-white/10 bg-navy py-4 backdrop-blur-xl shadow-elevated"
            : "bg-transparent py-6"
        }`}
      >
        <nav aria-label="Primary" className="section-shell flex items-center justify-between">
          <a href="#" className="focus-ring group flex items-center gap-2 rounded-full py-1">
            <span className="text-2xl font-serif font-semibold text-gold transition-colors group-hover:text-gold-light">
              ₦
            </span>
            <span className={`text-2xl font-serif font-semibold tracking-tight transition-colors duration-300 ${
              isScrolled ? "text-white" : "text-navy"
            }`}>
              9jawealth
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`focus-ring group relative rounded-full py-2 text-[15px] transition-colors duration-300 ${
                  isScrolled ? "text-white/78 hover:text-white" : "text-navy/78 hover:text-navy"
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 ${
                  isScrolled ? "bg-gold" : "bg-gold"
                }`} />
              </a>
            ))}
            <a
              href="#quiz"
              className="focus-ring rounded-full border border-gold/30 bg-gold px-5 py-2.5 font-display text-[15px] font-semibold text-navy shadow-[0_10px_25px_rgba(180,144,58,0.24)] hover:bg-gold-light"
            >
              Take the assessment
            </a>
          </div>

          <button
            type="button"
            className={`focus-ring rounded-full border p-3 transition-colors duration-300 md:hidden ${
              isScrolled ? "border-white/15 text-gold" : "border-navy/15 text-navy"
            }`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[rgba(16,24,38,0.56)] backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
              transition={{ duration: prefersReducedMotion ? 0.12 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="deep-panel fixed inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-white/10 p-6 shadow-2xl"
            >
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <p className="eyebrow mb-2">Navigation</p>
                  <p className="text-sm text-white/65">Move through the assessment and next steps.</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="focus-ring rounded-full border border-white/10 p-3 text-gold"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {navItems.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="focus-ring rounded-[1.5rem] border border-white/10 px-5 py-4 font-serif text-2xl text-white/92"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#quiz"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="focus-ring mt-3 rounded-[1.5rem] bg-gold px-5 py-4 text-center font-display text-base font-semibold text-navy"
                >
                  Begin the assessment
                </a>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/58">
                Move through the assessment, then choose the path that fits your goals best.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

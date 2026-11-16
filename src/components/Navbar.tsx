import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { navItems } from "@/src/content/site";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getVisibleFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
  return nodes.filter((el) => el.getClientRects().length > 0);
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const wasMenuOpen = useRef(false);
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
    if (!isMobileMenuOpen) {
      if (wasMenuOpen.current) {
        wasMenuOpen.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }

    wasMenuOpen.current = true;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileMenuOpen(false);
        return;
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusable = getVisibleFocusable(drawerRef.current);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!drawerRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    const frameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const navFocusClass = isScrolled ? "focus-ring-dark" : "focus-ring";

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-white/10 bg-navy py-4 shadow-elevated backdrop-blur-xl"
            : "bg-transparent py-5"
        }`}
      >
        <nav aria-label="Primary" className="section-shell flex items-center justify-between gap-4">
          <a href="#" className={`${navFocusClass} group flex shrink-0 items-center gap-2 rounded-full py-1`}>
            <span
              className={`text-2xl font-serif font-semibold transition-colors ${
                isScrolled
                  ? "text-gold-light group-hover:text-white"
                  : "text-gold-darker group-hover:text-navy"
              }`}
            >
              ₦
            </span>
            <span
              className={`text-2xl font-serif font-semibold tracking-tight transition-colors duration-300 ${
                isScrolled ? "text-white" : "text-navy"
              }`}
            >
              9jawealth
            </span>
          </a>

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            {navItems.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`${navFocusClass} group relative whitespace-nowrap rounded-full py-2 text-sm font-medium transition-colors duration-300 xl:text-[15px] ${
                  isScrolled ? "text-white/85 hover:text-white" : "text-navy/85 hover:text-navy"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 ${
                    isScrolled ? "bg-gold-light" : "bg-gold-darker"
                  }`}
                />
              </a>
            ))}
            <a
              href="#quiz"
              className={`${navFocusClass} whitespace-nowrap rounded-full bg-gold px-5 py-2.5 font-display text-sm font-semibold text-navy shadow-[0_10px_24px_rgba(180,144,58,0.24)] hover:bg-gold-light xl:text-[15px]`}
            >
              Take the assessment
            </a>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className={`${navFocusClass} flex min-h-11 min-w-11 items-center justify-center rounded-full border p-2.5 transition-colors duration-300 lg:hidden ${
              isScrolled ? "border-white/20 text-gold-light" : "border-navy/20 text-navy"
            }`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={22} strokeWidth={1.75} />
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
              className="fixed inset-0 bg-[rgba(16,24,38,0.58)] backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              ref={drawerRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: "100%" }}
              transition={{ duration: prefersReducedMotion ? 0.12 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="deep-panel fixed inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-white/12 p-6 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl font-semibold text-white">
                    <span className="mr-1.5 text-gold-light">₦</span>
                    9jawealth
                  </p>
                  <p className="mt-1 text-sm text-white/75">Financial clarity &amp; real estate advisory</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="focus-ring-dark flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 p-3 text-gold-light hover:border-gold-light/70"
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {navItems.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="focus-ring-dark rounded-xl border border-white/14 px-5 py-3.5 font-serif text-2xl text-white/95 hover:border-gold-light/60 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#quiz"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="focus-ring-dark mt-3 rounded-full bg-gold px-5 py-4 text-center font-display text-base font-semibold text-navy hover:bg-gold-light"
                >
                  Take the assessment
                </a>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/70">
                Complete your 4-minute financial diagnostic, then review the path suited to your goals.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

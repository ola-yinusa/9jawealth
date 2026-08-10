import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

export default function Popup() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const isDismissed = () => {
      const dismissed = localStorage.getItem("popup_dismissed_at");
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      return dismissed && Date.now() - parseInt(dismissed) < sevenDays;
    };

    if (isDismissed()) return;

    // Desktop: Exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !isDismissed()) {
        setIsOpen(true);
      }
    };

    // Mobile: 45s timer
    const timer = setTimeout(() => {
      if (!isDismissed()) {
        setIsOpen(true);
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleDismiss();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem("popup_dismissed_at", Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-[rgba(20,33,51,0.56)] backdrop-blur-sm"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            aria-describedby="popup-description"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            className="relative z-[2001] w-full max-w-[34rem] rounded-[2rem] border border-white/55 bg-paper p-8 shadow-[0_36px_90px_rgba(20,33,51,0.22)] md:p-10"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleDismiss}
              aria-label="Close dialog"
              className="focus-ring absolute right-4 top-4 rounded-full border border-border p-2 text-navy"
            >
              <X size={20} />
            </button>

            <p className="eyebrow mb-3">Continue your assessment</p>
            <h2 id="popup-title" className="mb-4 text-3xl font-medium italic text-navy md:text-4xl">
              Before you leave, complete your financial assessment.
            </h2>
            <p id="popup-description" className="mb-8 text-base leading-relaxed text-ink">
              Take the assessment to receive your full results by email and get a clear picture of where you stand financially.
            </p>

            <div className="space-y-4">
              <a
                href="#quiz"
                onClick={handleDismiss}
                className="focus-ring flex min-h-11 w-full items-center justify-center rounded-full bg-navy px-5 py-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white"
              >
                Return to the assessment
              </a>
              <p className="text-sm leading-relaxed text-muted">
                Closing this dialog stores a local dismissal timestamp in your browser for seven days.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

const DISMISS_KEY = "popup_dismissed_at";
const QUIZ_PROGRESS_KEY = "9jawealth-quiz-v1";
const QUIZ_RESULT_KEY = "9jawealth-quiz-result-v1";
const QUIZ_CONFIRMED_KEY = "9jawealth-quiz-confirmed-v1";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getVisibleFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
  return nodes.filter((el) => el.getClientRects().length > 0);
}

function isDismissedRecently(): boolean {
  try {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) return false;
    const timestamp = Number.parseInt(dismissed, 10);
    return Number.isFinite(timestamp) && Date.now() - timestamp < SEVEN_DAYS_MS;
  } catch {
    return false;
  }
}

function hasStartedOrSubmittedQuiz(): boolean {
  try {
    if (localStorage.getItem(QUIZ_RESULT_KEY)) return true;
    if (sessionStorage.getItem(QUIZ_CONFIRMED_KEY)) return true;

    const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { answers?: Record<string, unknown>; isFinished?: boolean } | null;
    if (!parsed || typeof parsed !== "object") return false;
    if (parsed.isFinished) return true;
    return Boolean(parsed.answers && Object.keys(parsed.answers).length > 0);
  } catch {
    return false;
  }
}

function isQuizElementVisible(): boolean {
  const quizEl = document.getElementById("quiz");
  if (!quizEl) return false;
  const rect = quizEl.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.9 && rect.bottom > 80;
}

export default function Popup() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isQuizIntersectingRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const canShowPopup = useCallback(() => {
    if (isDismissedRecently()) return false;
    if (hasStartedOrSubmittedQuiz()) return false;
    if (isQuizElementVisible()) return false;
    return true;
  }, []);

  useEffect(() => {
    const quizEl = document.getElementById("quiz");
    let observer: IntersectionObserver | null = null;

    if (quizEl && typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          isQuizIntersectingRef.current = entries.some((entry) => entry.isIntersecting);
        },
        { threshold: 0.05 },
      );
      observer.observe(quizEl);
    }

    const openSafely = () => {
      if (!canShowPopup()) return;
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setIsOpen(true);
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY < 0) {
        openSafely();
      }
    };

    const timer = window.setTimeout(openSafely, 45000);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [canShowPopup]);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Storage unavailable — dismissal still closes dialog for this view.
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = getVisibleFocusable(dialogRef.current);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (!dialogRef.current.contains(document.activeElement)) {
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
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-[rgba(20,33,51,0.58)] backdrop-blur-sm"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            aria-describedby="popup-description"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            className="relative z-[2001] w-full max-w-[34rem] rounded-2xl bg-paper p-8 shadow-[0_36px_90px_rgba(20,33,51,0.26)] md:p-10"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleDismiss}
              aria-label="Close dialog"
              className="focus-ring absolute right-4 top-4 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border-strong p-3 text-navy hover:border-navy/50"
            >
              <X size={20} strokeWidth={1.75} />
            </button>

            <h2 id="popup-title" className="mb-4 pr-12 text-3xl font-medium italic text-navy md:text-4xl">
              Before you go, check where your finances stand.
            </h2>
            <p id="popup-description" className="mb-8 text-base leading-relaxed text-ink">
              Take 4 minutes to check your money habits, protection, and income readiness before committing capital to property.
            </p>

            <div className="space-y-4">
              <a
                href="#quiz"
                onClick={handleDismiss}
                className="focus-ring flex min-h-12 w-full items-center justify-center rounded-full bg-navy px-5 py-3.5 font-display text-sm font-semibold text-white hover:bg-navy-soft"
              >
                Start the 4-minute assessment
              </a>
              <p className="text-sm leading-relaxed text-muted">
                Takes 4 minutes · Instant results on screen and by email.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

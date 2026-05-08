import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";

export default function WhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
          href="https://wa.link/fz5g34"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Start a WhatsApp conversation"
          className="focus-ring group fixed bottom-5 right-5 z-[1000] flex min-h-11 min-w-11 items-center gap-3 rounded-full border border-white/70 bg-white/92 px-3 py-3 text-navy shadow-[0_18px_48px_rgba(20,33,51,0.18)] backdrop-blur-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
            <MessageCircle size={22} fill="white" />
          </span>
          <span className="hidden pr-2 text-sm font-semibold sm:block">WhatsApp</span>
          <div className="pointer-events-none absolute right-full mr-4 hidden whitespace-nowrap rounded-full bg-navy px-3 py-2 text-xs font-medium text-gold shadow-xl transition-opacity group-hover:opacity-100 md:block md:opacity-0">
            Talk to the team
          </div>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

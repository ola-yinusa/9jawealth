import { ArrowRight, BookOpen, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const clarityPoints = [
  "4 minutes · 31 questions across 4 financial pillars",
  "Measures awareness, daily discipline, protection & income readiness",
  "Gives you a clear 4-section score and recommended next step",
];

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.12 : 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden pb-10 pt-24 md:pb-16 md:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_right,_rgba(20,33,51,0.08),_transparent_36%)]"
      />
      <div className="section-shell grid items-center gap-10 md:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-[42rem]"
        >
          <motion.h1
            variants={itemVariants}
            className="balance-text text-soft-shadow mb-5 max-w-[14ch] text-[clamp(2.8rem,6.4vw,5.2rem)] font-serif font-semibold italic leading-[1.03] tracking-[-0.03em] text-navy"
          >
            Know where your finances truly stand.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="balance-text mb-7 max-w-[38rem] text-lg leading-relaxed text-ink md:text-[1.18rem]"
          >
            A 4-minute check of your financial habits, protection, and income direction so your next property investment rests on numbers, not guesswork.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <motion.a
              href="#quiz"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 font-display text-base font-semibold text-white shadow-[0_18px_40px_rgba(20,33,51,0.18)] hover:bg-navy-soft"
            >
              <span>Take the 4-minute assessment</span>
              <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
            </motion.a>
            <a
              href="#paths"
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-border-strong bg-white/85 px-6 py-3.5 text-sm font-semibold text-navy hover:border-navy/45 hover:bg-white"
            >
              Explore Signature &amp; PalmVille
            </a>
          </motion.div>
          <motion.div variants={itemVariants}>
            <a
              href="/education"
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full py-1 text-sm font-medium text-navy underline decoration-gold-darker/55 hover:text-gold-darker hover:decoration-gold-darker"
            >
              <BookOpen size={16} strokeWidth={1.75} aria-hidden="true" className="text-gold-darker" />
              <span>Read the Nigeria Real Estate Investment Guide</span>
            </a>
          </motion.div>
        </motion.div>

        <motion.aside
          aria-label="Advisory overview"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.12 : 0.7, ease: [0.16, 1, 0.3, 1], delay: prefersReducedMotion ? 0 : 0.14 }}
          className="deep-panel relative rounded-2xl p-7 text-white shadow-[0_26px_64px_rgba(20,33,51,0.18)] md:p-8"
        >
          <h2 className="balance-text mb-4 text-2xl font-medium italic leading-snug text-white md:text-[1.75rem]">
            &ldquo;Wealth is not just what you earn this year. It is what you structure well enough to pass on.&rdquo;
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-white/82">
            Before committing capital to Lagos residential plots or Ogun agro-assets, see how resilient your cash buffer, monthly discipline, and long-term protection truly are.
          </p>
          <p className="mb-6 font-display text-xs font-semibold text-gold-light">
            Olanrewaju Yinusa · 5 years advising Nigerian &amp; diaspora investors
          </p>
          <ul className="space-y-3 border-t border-white/14 pt-5 text-sm text-white/88">
            {clarityPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <Check size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-gold-light" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-white/14 pt-4">
            <a
              href="#quiz"
              className="focus-ring-dark inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-light hover:text-white"
            >
              <span>Start the assessment</span>
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

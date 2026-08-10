import { motion, useReducedMotion, type Variants } from "framer-motion";
import { siteConfig } from "@/src/content/site";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.12 : 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-48 md:pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="section-shell relative z-10 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-3">
            <span className="eyebrow px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5">
              Disciplined Forex Education
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="balance-text mb-6 text-[clamp(2.8rem,7vw,5.5rem)] font-serif font-medium leading-[1] text-white"
          >
            Master Your Emotions.<br />
            <span className="italic text-gold-light">Master the Market.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="balance-text mb-10 max-w-2xl text-lg leading-relaxed text-white/60 md:text-xl"
          >
            A disciplined forex education and signal ecosystem designed to help you develop financial structure, emotional control, and long-term trading skills.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#plans"
              className="focus-ring min-h-12 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 font-display text-[15px] font-semibold text-void shadow-[0_0_30px_rgba(180,144,58,0.2)] hover:bg-gold-light transition-all"
            >
              View Signal Plans
            </a>
            <a
              href={siteConfig.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring min-h-12 inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3 font-display text-[15px] font-semibold text-white hover:bg-white/5 transition-all"
            >
              Join Telegram Community
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/5 w-full max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center">
              <span className="text-gold-light font-display font-semibold mb-1">Weekly Signals</span>
              <span className="text-sm text-white/50">Precise entry, SL, and TP</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gold-light font-display font-semibold mb-1">Demo-First</span>
              <span className="text-sm text-white/50">Practice without pressure</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gold-light font-display font-semibold mb-1">Private Community</span>
              <span className="text-sm text-white/50">Learn alongside others</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

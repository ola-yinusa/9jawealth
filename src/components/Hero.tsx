import { motion, useReducedMotion } from "motion/react";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.18,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.12 : 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative overflow-hidden pb-18 pt-28 md:pb-24 md:pt-36">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_right,_rgba(20,33,51,0.08),_transparent_36%)]"
      />
      <div className="section-shell grid items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-[42rem]"
        >
          <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center gap-3">
            <span className="eyebrow rounded-full border border-gold/25 bg-white/75 px-4 py-2">
              Financial clarity assessment
            </span>
            <span className="rounded-full border border-navy/8 bg-white/75 px-4 py-2 text-xs tracking-[0.14em] text-muted uppercase">
              Live experience
            </span>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="balance-text text-soft-shadow mb-6 max-w-[12ch] text-[clamp(3rem,7vw,5.8rem)] font-serif font-semibold italic leading-[0.95] tracking-[-0.04em] text-navy"
          >
            Know where your finances truly stand.
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="balance-text mb-8 max-w-[38rem] text-lg leading-relaxed text-ink md:text-[1.2rem]"
          >
            Diagnose your financial health with our guided assessment built to help you reflect on readiness, habits, and long-term direction.
          </motion.p>
          <motion.div variants={itemVariants} className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <motion.a
              href="#quiz"
              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-8 py-4 font-display text-base font-semibold text-white shadow-[0_20px_45px_rgba(20,33,51,0.18)]"
            >
              Take the 2-minute assessment
            </motion.a>
            <a
              href="#paths"
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-border-strong px-6 py-4 text-sm font-semibold tracking-[0.08em] text-navy uppercase"
            >
              Explore the two paths
            </a>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="surface-panel card-outline grid max-w-[44rem] gap-4 rounded-[2rem] border border-border px-5 py-5 md:grid-cols-3 md:px-6"
          >
            <div className="min-w-0">
              <p className="eyebrow mb-2">What this is</p>
              <p className="text-sm leading-relaxed text-ink">A refined assessment experience designed to capture real financial intent and readiness.</p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow mb-2">What it avoids</p>
              <p className="text-sm leading-relaxed text-ink">No hype, no noise, and no artificial urgency — just a grounded initial diagnosis.</p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow mb-2">What comes next</p>
              <p className="text-sm leading-relaxed text-ink">Automated report delivery is active, sending your results straight to your inbox.</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.12 : 0.8, ease: [0.16, 1, 0.3, 1], delay: prefersReducedMotion ? 0 : 0.18 }}
          className="relative md:pl-6"
        >
          <div className="absolute -inset-5 rounded-[2.5rem] border border-white/50 bg-white/55 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/80 p-4 shadow-[0_36px_80px_rgba(20,33,51,0.18)] backdrop-blur-sm md:p-5">
            <div className="mb-4 flex items-center justify-between rounded-[1.4rem] border border-border bg-white/85 px-4 py-3">
              <div>
                <p className="eyebrow mb-1">Trust-first framing</p>
                <p className="text-sm text-ink">Clarity before action.</p>
              </div>
              <div className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-navy">
                Preview
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[1.7rem]">
              <img
                src="/images/olaohms-portrait-suit.webp"
                alt="Olanrewaju standing in a dark suit while holding an award plaque."
                width="1080"
                height="1080"
                className="aspect-[4/5] w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/66 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="max-w-sm rounded-[1.5rem] border border-white/14 bg-[rgba(20,33,51,0.78)] px-5 py-4 backdrop-blur-md">
                  <p className="eyebrow mb-2 text-gold-light">A better first impression</p>
                  <p className="balance-text text-base leading-relaxed text-white/90">
                    The experience is designed to make you feel guided, respected, and ready to take the next step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

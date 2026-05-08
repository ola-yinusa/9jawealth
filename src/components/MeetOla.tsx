import { motion } from "motion/react";

export default function MeetOla() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="section-shell grid items-center gap-14 md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
        <div className="order-2 w-full md:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[3rem] border border-gold/14 bg-[radial-gradient(circle_at_top,_rgba(180,144,58,0.14),_transparent_56%)]" />
            <img
              src="/images/olaohms-award-portrait.jpg"
              alt="Olaohms holding a recognition award in front of a patterned event backdrop."
              width="1080"
              height="1080"
              className="relative z-10 aspect-[4/5] w-full rounded-[2.6rem_1.25rem_2.6rem_1.25rem] object-cover shadow-[0_34px_80px_rgba(20,33,51,0.18)]"
              loading="lazy"
            />
          </motion.div>
        </div>

        <div className="order-1 w-full md:order-2">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow mb-4 block">
              Your guide
            </span>
            <h2 className="balance-text mb-6 text-4xl font-medium leading-[1.08] text-navy md:text-5xl">
              Olaohms frames wealth through clarity first, then action.
            </h2>
            <p className="mb-6 max-w-2xl text-[17px] leading-relaxed text-ink">
              Olanrewaju Yinusa has spent more than five years helping Nigerians think more deliberately about financial growth. Through money-markets guidance and land-led investment conversations, he has built a brand that links opportunity with structure instead of noise.
            </p>
            <p className="mb-10 max-w-2xl text-[17px] leading-relaxed text-ink">
              This assessment exists as a front door for that philosophy: understand your current position, notice the weak points, and then move into the path that fits you best.
            </p>

            <div className="mb-10 flex flex-wrap gap-4">
              <div className="surface-panel card-outline inline-flex min-h-11 items-center gap-3 rounded-full border border-border px-5 py-3">
                <span className="text-xl font-bold text-gold">500+</span>
                <span className="text-sm text-navy">Signal members guided</span>
              </div>
              <div className="surface-panel card-outline inline-flex min-h-11 items-center gap-3 rounded-full border border-border px-5 py-3">
                <span className="text-xl font-bold text-gold">₦200M+</span>
                <span className="text-sm text-navy">Property transaction value</span>
              </div>
            </div>

            <a
              href="#paths"
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-navy/12 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-navy"
            >
              Explore the available paths
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

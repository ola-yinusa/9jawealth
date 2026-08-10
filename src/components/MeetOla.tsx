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
              src="/images/olaohms-award-portrait-v2.jpg"
              alt="Olanrewaju at the Zylus thanksgiving and awards 2026."
              width="1080"
              height="1080"
              className="relative z-10 aspect-[4/5] w-full rounded-[2.6rem_1.25rem_2.6rem_1.25rem] object-cover shadow-[0_34px_80px_rgba(20,33,51,0.18)]"
              loading="lazy"
            />
            <div className="absolute bottom-6 left-6 right-6 z-20 rounded-[1.5rem] border border-white/14 bg-[rgba(20,33,51,0.78)] px-5 py-4 backdrop-blur-md">
              <p className="eyebrow mb-1 text-gold-light">Zylus Thanksgiving & Awards 2026</p>
              <p className="text-sm leading-relaxed text-white/82">5 years of advising investors in the real estate sector.</p>
            </div>
          </motion.div>
        </div>

        <div className="order-1 w-full md:order-2">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow mb-4 block">
              About us
            </span>
            <h2 className="balance-text mb-6 text-4xl font-medium leading-[1.08] text-navy md:text-5xl">
              Your guide
            </h2>
            <p className="mb-6 max-w-2xl text-[17px] leading-relaxed text-ink">
              Olanrewaju has spent 5 years helping Nigerians like you think more deliberately about financial growth. Through gold trading guidance and property investment conversations, he has built a brand that links financial opportunity with plug-and-play structure.
            </p>
            <p className="mb-10 max-w-2xl text-[17px] leading-relaxed text-ink">
              Olanrewaju frames wealth through clarity first, then action. This assessment exists as the front door for that philosophy: understand your current position, notice the weak points, and then move into the path that fits you best.
            </p>

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

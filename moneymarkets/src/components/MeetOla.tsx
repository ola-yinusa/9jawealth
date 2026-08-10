import { motion } from "framer-motion";

export default function MeetOla() {
  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-gold opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="section-shell grid items-center gap-14 md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] relative z-10">

        {/* Image Column */}
        <div className="order-2 w-full md:order-1">
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ambient Gold Border & Radial Gradient */}
            <div className="absolute -inset-6 rounded-[3rem] border border-gold/10 bg-[radial-gradient(circle_at_top,_rgba(180,144,58,0.08),_transparent_56%)]" />

            <img
              src="/images/olaohms-award-portrait-v2.jpg"
              alt="Olanrewaju at the Zylus thanksgiving and awards 2026."
              width="1080"
              height="1080"
              className="relative z-10 aspect-[4/5] w-full rounded-[2.6rem_1.25rem_2.6rem_1.25rem] object-cover border border-white/5 shadow-2xl"
              loading="lazy"
            />

            {/* Elegant Dark Glassmorphic Card */}
            <div className="absolute bottom-6 left-6 right-6 z-20 rounded-[1.5rem] border border-white/10 bg-surface-overlay/80 px-5 py-4 backdrop-blur-md">
              <p className="eyebrow mb-1 text-gold-light">Zylus Thanksgiving & Awards 2026</p>
              <p className="text-xs leading-relaxed text-white/70">5 years of advising investors in the real estate and financial sectors.</p>
            </div>
          </motion.div>
        </div>

        {/* Text Column */}
        <div className="order-1 w-full md:order-2">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="eyebrow mb-4 block">
              About us
            </span>
            <h2 className="balance-text mb-6 text-3xl font-serif text-white md:text-5xl leading-tight">
              Meet Your Guide
            </h2>
            <p className="mb-6 max-w-2xl text-[16px] leading-relaxed text-white/60">
              Olanrewaju has spent 5 years helping Nigerians like you think more deliberately about financial growth. Through gold trading guidance and property investment conversations, he has built a brand that links financial opportunity with plug-and-play structure.
            </p>
            <p className="mb-10 max-w-2xl text-[16px] leading-relaxed text-white/60">
              Olanrewaju frames wealth through clarity first, then action. This forex ecosystem exists as a direct extension of that philosophy: cutting through the noise, maintaining absolute emotional discipline, and taking measured, skill-based paths to consistent growth.
            </p>

            <a
              href="#signals"
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-white/10 px-6 py-3 text-xs font-display font-semibold uppercase tracking-[0.12em] text-white hover:bg-white/5 transition-colors"
            >
              Explore Signal Membership
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

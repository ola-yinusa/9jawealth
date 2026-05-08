import { motion } from "motion/react";
import { pillars } from "@/src/content/site";

export default function Pillars() {
  return (
    <section className="py-20 md:py-24">
      <div className="section-shell">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-3">Why this page feels different</p>
          <h2 className="balance-text text-4xl font-medium leading-tight text-navy md:text-5xl">
            Premium finance design works best when it feels composed, not loud.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, transition: { duration: 0.28 } }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="card-outline group relative overflow-hidden rounded-[2rem] border border-border bg-white/75 p-8 backdrop-blur-sm"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/10 via-gold/60 to-gold/10" />
            <span className="absolute right-4 top-4 select-none font-serif text-7xl italic text-navy/8 transition-colors group-hover:text-navy/12">
              {pillar.number}
            </span>
            <div className="relative z-10">
              <span className="eyebrow mb-4 block">
                {pillar.eyebrow}
              </span>
              <h3 className="balance-text mb-4 text-2xl font-medium leading-[1.18] text-navy">
                {pillar.title}
              </h3>
              <p className="text-[16px] leading-relaxed text-ink">
                {pillar.body}
              </p>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}

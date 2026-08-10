import { motion, useReducedMotion } from "framer-motion";
import { pillars } from "@/src/content/site";

export default function Philosophy() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="philosophy" className="py-24 relative">
      <div className="section-shell">
        <div className="mb-16 md:w-2/3">
          <p className="eyebrow mb-4">Why this is different</p>
          <h2 className="balance-text text-3xl font-serif text-white md:text-5xl">
            Trading is not gambling when you have structure.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            // Create asymmetrical rhythm
            const mtClass = index === 1 ? "md:mt-12" : index === 2 ? "md:mt-24" : "";

            return (
              <motion.div
                key={pillar.number}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-card relative overflow-hidden rounded-[2rem] p-8 ${mtClass}`}
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                <span className="absolute right-4 top-4 font-serif text-6xl italic text-white/5 select-none">
                  {pillar.number}
                </span>

                <div className="relative z-10 pt-4">
                  <span className="eyebrow block mb-3 text-gold">
                    {pillar.eyebrow}
                  </span>
                  <h3 className="text-xl font-medium text-white mb-4 pr-6">
                    {pillar.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/60">
                    {pillar.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

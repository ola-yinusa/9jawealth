import { motion } from "motion/react";
import { paths } from "@/src/content/site";

export default function Paths() {
  return (
    <section id="paths" className="py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-16 max-w-3xl">
          <p className="eyebrow mb-3">Two paths forward</p>
          <h2 className="mb-4 text-4xl font-medium text-navy md:text-5xl">
            Two Paths Forward
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ink">
            Once the assessment gives you clarity, choose the path that fits your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {paths.map((path, index) => (
            <motion.a
              key={path.id}
              href={path.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-navy/10 shadow-[0_30px_80px_rgba(20,33,51,0.12)]"
            >
              <div
                aria-hidden="true"
                className={`absolute inset-0 ${path.id === "real-estate"
                    ? "bg-[radial-gradient(circle_at_top_left,_rgba(180,144,58,0.42),_transparent_34%),linear-gradient(180deg,_rgba(20,33,51,0.82),_rgba(20,33,51,0.96))]"
                    : "bg-[radial-gradient(circle_at_top_right,_rgba(242,226,187,0.28),_transparent_34%),linear-gradient(180deg,_rgba(28,45,33,0.76),_rgba(16,26,20,0.94))]"
                  }`}
              />
              <div
                aria-hidden="true"
                className="absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full border border-white/10 bg-white/6 blur-xl"
              />
              <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-10">
                <span className="eyebrow mb-4 text-gold-light">{path.eyebrow}</span>
                <h3 className="balance-text mb-4 text-3xl font-medium italic leading-tight text-white">
                  {path.title}
                </h3>
                <p className="mb-8 max-w-md text-[15px] leading-relaxed text-white/82">
                  {path.body}
                </p>
                <div className="inline-flex min-h-11 items-center self-start rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                  {path.cta}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

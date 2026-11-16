import { ArrowRight, ArrowUpRight, BookOpen, Calendar } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { paths } from "@/src/content/site";

export default function Paths() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="paths" className="scroll-mt-24 py-20 md:py-28">
      <div className="section-shell">
        <div className="mb-12 max-w-3xl">
          <h2 className="mb-4 text-4xl font-medium text-navy md:text-5xl">
            Two Paths Forward
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ink">
            Once you know where your finances stand, compare our two vetted property investments or read the full Nigerian real estate guide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {paths.map((path, index) => {
            const isSignature = path.id === "real-estate";

            return (
              <motion.article
                key={path.id}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0.12 : 0.45, delay: prefersReducedMotion ? 0 : index * 0.08 }}
                className="flex flex-col overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(20,33,51,0.14)]"
              >
                <div className={`relative h-64 w-full overflow-hidden md:h-72 ${isSignature ? "bg-navy" : "bg-palm-deep"}`}>
                  <img
                    src={path.image}
                    alt={path.imageAlt}
                    width={path.imageWidth}
                    height={path.imageHeight}
                    loading="lazy"
                    className={`h-full w-full object-cover ${
                      isSignature ? "object-center" : "object-[50%_30%]"
                    }`}
                  />
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${
                      isSignature ? "from-navy/95" : "from-palm/95"
                    } to-transparent`}
                  />
                </div>

                <div
                  className={`flex flex-1 flex-col justify-between p-7 md:p-9 ${
                    isSignature ? "deep-panel" : "palm-panel"
                  }`}
                >
                  <div>
                    <h3 className="balance-text mb-2 text-2xl font-medium italic leading-tight text-white md:text-3xl">
                      {path.title}
                    </h3>
                    <p className="mb-4 text-sm font-medium text-gold-light">
                      {path.location}
                    </p>
                    <p className="mb-6 max-w-lg text-[15px] leading-relaxed text-white/85">
                      {path.body}
                    </p>
                  </div>

                  <div>
                    {path.specs.length > 0 ? (
                      <ul className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/14 pt-4 text-[13px] font-medium text-white/84">
                        {path.specs.map((spec, specIndex) => (
                          <li key={spec} className="inline-flex items-center gap-3">
                            {specIndex > 0 ? (
                              <span aria-hidden="true" className="text-gold-light/70">·</span>
                            ) : null}
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <a
                      href={path.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring-dark inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-display text-sm font-semibold text-white hover:border-gold-light hover:bg-gold hover:text-navy"
                    >
                      <span>{path.cta}</span>
                      <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="surface-panel mt-10 flex flex-col gap-6 rounded-2xl border border-border p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-xl">
            <h3 className="mb-2 text-2xl font-medium text-navy">
              Compare strategies before you commit capital
            </h3>
            <p className="text-sm leading-relaxed text-ink">
              Review land banking, off-plan, buy-to-build, and agro-real estate side by side in the Investment Guide, or book a 1-on-1 walkthrough with Olanrewaju.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/education"
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-border-strong bg-white px-5 py-3 font-display text-sm font-semibold text-navy hover:border-navy/45"
            >
              <BookOpen size={15} strokeWidth={1.75} aria-hidden="true" />
              <span>Investment Guide</span>
              <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <a
              href="/education#book"
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-5 py-3 font-display text-sm font-semibold text-white hover:bg-navy-soft"
            >
              <Calendar size={15} strokeWidth={1.75} aria-hidden="true" />
              <span>Book Consultation</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

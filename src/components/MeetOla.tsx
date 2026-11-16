import { Calendar } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export default function MeetOla() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="about" className="scroll-mt-24 py-20 md:py-28">
      <div className="section-shell grid items-center gap-12 md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] md:gap-14">
        <div className="order-2 w-full md:order-1">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl shadow-[0_28px_70px_rgba(20,33,51,0.16)]"
          >
            <img
              src="/images/olaohms-award-portrait-v2.jpg"
              alt="Olanrewaju Yinusa, founder of 9jawealth, standing on site at Lekki Avana Bungalow and Resort."
              width={1080}
              height={1350}
              className="aspect-[4/5] w-full object-cover object-[center_18%]"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/88 to-transparent px-6 pb-5 pt-12 text-white">
              <p className="font-serif text-xl font-medium text-white">Olanrewaju Yinusa</p>
              <p className="mt-1 text-sm text-white/82">
                Founder, 9jawealth · 5 years advising real estate investors
              </p>
            </div>
          </motion.div>
        </div>

        <div className="order-1 w-full md:order-2">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="balance-text mb-5 text-4xl font-medium leading-[1.06] text-navy md:text-5xl">
              Olanrewaju Yinusa
            </h2>

            <div className="mb-7 inline-flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3.5">
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif text-2xl font-semibold italic text-navy">Ọlá</span>
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-gold-darker">
                  Wealth
                </span>
              </div>
              <span aria-hidden="true" className="font-serif text-lg text-gold-darker">+</span>
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif text-2xl font-semibold italic text-navy">Nrewaju</span>
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-gold-darker">
                  Goes forward
                </span>
              </div>
            </div>

            <p className="mb-5 max-w-2xl text-[17px] leading-relaxed text-ink">
              My name has always been my purpose: <em className="font-serif text-xl font-semibold text-navy">wealth goes forward</em>, not just for me, but for everyone I walk alongside. Growing up, very few people around me had a clear plan for generational wealth. Helping families build one is the work I care about most.
            </p>
            <p className="mb-5 max-w-2xl text-[17px] leading-relaxed text-ink">
              Over the past five years, I have combined practical financial education with verified property ownership, helping clients buy land and agricultural assets that actually fit their cashflow and timeline.
            </p>
            <p className="mb-9 max-w-2xl text-[17px] leading-relaxed text-ink">
              I created 9jawealth so you can see where your finances stand before committing capital. Start with the assessment to spot the gaps worth closing, then choose the property strategy that moves your wealth forward.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#paths"
                className="focus-ring inline-flex min-h-12 items-center rounded-full border border-border-strong bg-white px-6 py-3 text-sm font-semibold text-navy hover:border-navy/45"
              >
                Explore the available paths
              </a>
              <a
                href="/education#book"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-soft"
              >
                <Calendar size={16} strokeWidth={1.75} aria-hidden="true" />
                <span>Book a 1-on-1 Consultation</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

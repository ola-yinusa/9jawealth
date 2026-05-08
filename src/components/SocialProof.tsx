import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { proofStats } from "@/src/content/site";

function Counter({ value, label }: { value: string; label: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1200;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
    }
  }, [isInView, numericValue]);

  return (
    <div ref={ref} className="text-center">
      <div className="mb-2 flex justify-center text-4xl font-bold text-gold md:text-5xl">
        {displayValue.toLocaleString()}
        <span className="ml-1 text-3xl md:text-4xl">{suffix}</span>
      </div>
      <p className="mx-auto max-w-[16ch] text-[13px] uppercase tracking-[0.18em] text-white/62">{label}</p>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="py-24">
      <div className="section-shell">
        <div className="deep-panel rounded-[2.3rem] border border-white/8 px-6 py-12 md:px-12">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Social proof</p>
            <h2 className="balance-text text-3xl font-medium leading-tight text-white md:text-4xl">
              The proof section should feel composed and substantial, not like a noisy metric strip.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {proofStats.map((stat, index) => (
              <div key={stat.label} className="relative">
                {index < proofStats.length - 1 ? (
                  <div className="absolute right-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-gold/18 md:block" />
                ) : null}
                <Counter value={stat.value} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

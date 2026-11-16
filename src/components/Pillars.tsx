import { pillars } from "@/src/content/site";

export default function Pillars() {
  return (
    <section aria-labelledby="pillars-heading" className="border-y border-border bg-cream/45 py-10 md:py-12">
      <div className="section-shell">
        <h2 id="pillars-heading" className="balance-text mb-6 max-w-2xl text-2xl font-medium leading-tight text-navy md:text-3xl">
          Three steps before you invest in land.
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.id}
              className={
                index === 0
                  ? "md:pr-8"
                  : index === 1
                    ? "border-t border-border pt-5 md:border-t-0 md:px-8 md:pt-0"
                    : "border-t border-border pt-5 md:border-t-0 md:pl-8 md:pt-0"
              }
            >
              <h3 className="balance-text mb-2 text-xl font-semibold leading-snug text-navy md:text-[1.35rem]">
                {pillar.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

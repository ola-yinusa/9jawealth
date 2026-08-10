import { recentTrades, trackRecordStats } from "@/src/content/track-record";

export default function TrackRecord() {
  return (
    <section id="proof" className="py-24 bg-surface-raised/30 border-y border-white/5">
      <div className="section-shell">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Transparent Performance</p>
            <h2 className="text-3xl font-serif text-white md:text-5xl mb-4">
              Our Recent Trades
            </h2>
            <p className="text-white/60 leading-relaxed text-[17px]">
              We don't hide our losses. A disciplined trader understands that losing trades are business expenses. Here is our unfiltered recent performance.
            </p>
          </div>

          <div className="mt-8 md:mt-0 flex gap-6">
            <div className="text-right">
              <p className="text-[11px] font-display uppercase tracking-widest text-white/40 mb-1">Win Rate</p>
              <p className="text-3xl font-serif text-gold-light">{trackRecordStats.winRate}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[11px] font-display uppercase tracking-widest text-white/40 mb-1">Avg R:R</p>
              <p className="text-3xl font-serif text-white">{trackRecordStats.avgRiskReward}</p>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 text-left text-xs font-display uppercase tracking-wider text-white/40 font-semibold">Date</th>
                <th className="py-4 text-left text-xs font-display uppercase tracking-wider text-white/40 font-semibold">Pair</th>
                <th className="py-4 text-left text-xs font-display uppercase tracking-wider text-white/40 font-semibold">Direction</th>
                <th className="py-4 text-left text-xs font-display uppercase tracking-wider text-white/40 font-semibold">Entry</th>
                <th className="py-4 text-left text-xs font-display uppercase tracking-wider text-white/40 font-semibold">Outcome</th>
                <th className="py-4 text-right text-xs font-display uppercase tracking-wider text-white/40 font-semibold">Pips</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 text-sm text-white/70">{trade.date}</td>
                  <td className="py-5 text-sm font-semibold text-white">{trade.pair}</td>
                  <td className="py-5">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      trade.direction === "BUY" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="py-5 text-sm text-white/60">{trade.entry}</td>
                  <td className="py-5">
                    <span className={`text-sm font-medium ${
                      trade.outcome === "TP HIT" ? "text-green-400" :
                      trade.outcome === "SL HIT" ? "text-red-400" :
                      "text-white/60"
                    }`}>
                      {trade.outcome}
                    </span>
                  </td>
                  <td className="py-5 text-right font-display text-sm">
                    <span className={trade.pips && trade.pips > 0 ? "text-green-400" : trade.pips && trade.pips < 0 ? "text-red-400" : "text-white/50"}>
                      {trade.pips !== null ? (trade.pips > 0 ? `+${trade.pips}` : trade.pips) : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/30 max-w-2xl mx-auto italic">
            Trading involves significant risk. Past performance does not guarantee future results.
            Only trade with capital you can afford to lose.
          </p>
        </div>
      </div>
    </section>
  );
}

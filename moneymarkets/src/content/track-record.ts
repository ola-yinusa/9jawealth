export interface TradeRecord {
  id: string;
  date: string;
  pair: string;
  direction: "BUY" | "SELL";
  entry: string;
  outcome: "TP HIT" | "SL HIT" | "BREAKEVEN" | "RUNNING";
  pips: number | null;
}

// Olanrewaju needs to update this with real data
export const recentTrades: TradeRecord[] = [
  { id: "1", date: "2026-05-24", pair: "XAU/USD", direction: "BUY", entry: "2410.50", outcome: "TP HIT", pips: 45 },
  { id: "2", date: "2026-05-23", pair: "GBP/JPY", direction: "SELL", entry: "198.20", outcome: "SL HIT", pips: -20 },
  { id: "3", date: "2026-05-22", pair: "XAU/USD", direction: "SELL", entry: "2425.00", outcome: "TP HIT", pips: 60 },
  { id: "4", date: "2026-05-21", pair: "EUR/USD", direction: "BUY", entry: "1.0850", outcome: "BREAKEVEN", pips: 0 },
  { id: "5", date: "2026-05-20", pair: "XAU/USD", direction: "BUY", entry: "2390.00", outcome: "TP HIT", pips: 85 },
];

export const trackRecordStats = {
  winRate: "72%",
  avgRiskReward: "1:2.5",
  totalPipsMonth: "+420",
};

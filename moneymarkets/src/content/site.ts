export interface PillarItem {
  number: string;
  eyebrow: string;
  title: string;
  body: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const siteConfig = {
  telegramLink: "https://t.me/olaohms_support", // Replace with real link
  parentSite: "https://9jawealth.com",
};

export const pillars: PillarItem[] = [
  {
    number: "01",
    eyebrow: "Discipline first",
    title: "Forex is a skill, not a slot machine.",
    body: "We teach structure, risk management, and emotional control before anything else. It's about building a system you can rely on.",
  },
  {
    number: "02",
    eyebrow: "Consistency over hype",
    title: "One good habit beats one lucky trade.",
    body: "Our signals and education focus on repeatable processes, not overnight flips. Wealth is built through compounding good decisions.",
  },
  {
    number: "03",
    eyebrow: "Guided progression",
    title: "From demo to confident, at your pace.",
    body: "Start on a demo account, follow our structured signals, learn the reasoning behind every trade, and only scale when you are truly ready.",
  },
];

export const faqs: FAQItem[] = [
  {
    question: "Do I need trading experience?",
    answer: "No. Our signals come with clear entry, stop-loss, and take-profit levels. We strongly encourage beginners to start on a demo account while they learn the mechanics without risking real money."
  },
  {
    question: "What pairs do you trade?",
    answer: "We focus heavily on XAU/USD (Gold) and select major forex pairs. We prefer deep liquidity and clear structural setups over trading everything."
  },
  {
    question: "How are signals delivered?",
    answer: "Signals are delivered directly via our private Telegram channel. Each signal includes exact levels and the strategic rationale behind the trade."
  },
  {
    question: "Is this gambling?",
    answer: "Absolutely not. Gambling relies on luck. We rely on strict risk management, probability, and emotional discipline. If you are looking for a 'get rich quick' flip, this is not the right place for you."
  },
  {
    question: "How do I access the course?",
    answer: "Once you complete your payment via Telegram, an admin will manually issue you a unique access code. You can enter that code on our /course page to unlock lifetime access."
  }
];

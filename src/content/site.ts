export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface PillarItem {
  number: string;
  eyebrow: string;
  title: string;
  body: string;
}

export interface PathItem {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Assessment", href: "#quiz" },
  { label: "About Olanrewaju", href: "#about" },
  { label: "Gold Trading", href: "https://forex.9jawealth.com", external: true },
];

export const pillars: PillarItem[] = [
  {
    number: "01",
    eyebrow: "Financial clarity",
    title: "A calm diagnosis before any recommendation.",
    body: "The assessment helps you reflect on habits, planning, and preparedness before considering a next step.",
  },
  {
    number: "02",
    eyebrow: "Disciplined opportunity",
    title: "Structured to educate, not to hype.",
    body: "Our money-market path is deliberately crafted to educate and keep you consistent — not hype-driven.",
  },
  {
    number: "03",
    eyebrow: "Long-view wealth",
    title: "Property as a patient route toward legacy.",
    body: "Our real estate path emphasises wealth retention and legacy building rather than noise.",
  },
];

export const paths: PathItem[] = [
  {
    id: "gold-trading",
    eyebrow: "Why Gold?",
    title: "Gold is the premier, high-liquidity, safe-haven asset of 2026.",
    body: "Trading gold on Forex is popular due to its superior volatility for profit compared to standard currency pairs. With central banks actively buying and rising geopolitical risks, gold is frequently seen as a more reliable long-term trend vehicle than fiat currencies.",
    cta: "Visit the gold trading experience",
    href: "https://forex.9jawealth.com",
    image: "/images/olaohms-portrait-suit.webp",
  },
];

export const footerLinks = {
  navigation: navItems,
  connect: [
    { label: "WhatsApp conversation", href: "https://wa.link/fz5g34", external: true },
    { label: "Gold trading experience", href: "https://forex.9jawealth.com", external: true },
    ],
  legal: [
    { label: "Privacy notice", href: "#privacy" },
    { label: "Terms", href: "#terms" },
  ],
};

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/yinusa.lanre" },
  { label: "LinkedIn", href: "https://linkedin.com/in/olanrewaju-yinusa" },
  { label: "WhatsApp", href: "https://wa.link/fz5g34" },
];

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

export interface StatItem {
  value: string;
  label: string;
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
  { label: "About Olaohms", href: "#about" },
  { label: "Money Markets", href: "https://moneymarkets.9jawealth.com", external: true },
  { label: "Real Estate", href: "https://realestate.9jawealth.com", external: true },
];

export const pillars: PillarItem[] = [
  {
    number: "01",
    eyebrow: "Financial clarity",
    title: "A calm diagnosis before any recommendation.",
    body: "The assessment helps visitors reflect on habits, planning, and preparedness before considering a next step.",
  },
  {
    number: "02",
    eyebrow: "Disciplined opportunity",
    title: "Signals and strategy framed through responsibility.",
    body: "The money-markets path should feel deliberate and educational, not adrenaline-led or hype-driven.",
  },
  {
    number: "03",
    eyebrow: "Long-view wealth",
    title: "Property as a patient route toward legacy.",
    body: "The real-estate path emphasizes stewardship, durability, and generational thinking rather than noise.",
  },
];

export const proofStats: StatItem[] = [
  { value: "500+", label: "Signal members guided" },
  { value: "₦200M+", label: "Property transaction value" },
  { value: "5+", label: "Years building financial paths" },
];

export const paths: PathItem[] = [
  {
    id: "money-markets",
    eyebrow: "Money markets",
    title: "Build exposure with more structure and less noise.",
    body: "Explore a guided money-markets experience built for people who want discipline, clarity, and a steadier decision framework.",
    cta: "Visit the money-markets experience",
    href: "https://moneymarkets.9jawealth.com",
    image: "/images/olaohms-portrait-suit.webp",
  },
  {
    id: "real-estate",
    eyebrow: "Real estate",
    title: "Build an asset base that can outlast the cycle.",
    body: "Discover a land-led path for people seeking a steadier, longer-term wealth narrative rooted in ownership.",
    cta: "Explore the property path",
    href: "https://realestate.9jawealth.com",
    image: "/images/olaohms-award-portrait.jpg",
  },
];

export const footerLinks = {
  navigation: navItems,
  connect: [
    { label: "WhatsApp conversation", href: "https://wa.link/fz5g34", external: true },
    { label: "Money-markets experience", href: "https://moneymarkets.9jawealth.com", external: true },
    { label: "Real-estate experience", href: "https://realestate.9jawealth.com", external: true },
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

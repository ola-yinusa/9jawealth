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
  { label: "Wealth Paths", href: "#paths" },
  { label: "Investment Guide", href: "/education.html" },
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
    body: "Our wealth-building framework is deliberately crafted to educate and keep you consistent — not hype-driven.",
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
    id: "real-estate",
    eyebrow: "Resort Palm Estate · Ibeju Lekki",
    title: "Explore Lekki Avana Signature plots and payment plans.",
    body: "Compare 300, 500, 600 and 1,000 SQM plots in a 3,000-palm-tree estate with completed gatehouse infrastructure, physical allocation underway, and 6- to 12-month payment plans.",
    cta: "Review Lekki Avana Signature",
    href: "https://signature.9jawealth.com/",
    image: "/images/WhatsApp Image 2026-10-16 at 8.56.51 AM.jpeg",
  },
  {
    id: "agro-real-estate",
    eyebrow: "Agro Real Estate · Ogun State",
    title: "Own registered oil-palm land that earns for decades at PalmVille.",
    body: "A plug-and-play oil palm plantation in Obafemi-Owode, Ogun State. Pay once for permanent land ownership with Registered Survey and Deed of Assignment while expert agronomists manage the harvest.",
    cta: "Explore PalmVille Plantation",
    href: "https://palmville.9jawealth.com/",
    image: "/palmville/images/hero-harvest.webp",
  },
];

export const footerLinks = {
  navigation: navItems,
  connect: [
    { label: "WhatsApp conversation", href: "https://wa.link/fz5g34", external: true },
    { label: "Lekki Avana Signature", href: "https://signature.9jawealth.com/", external: true },
    { label: "PalmVille Agro Real Estate", href: "https://palmville.9jawealth.com/", external: true },
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

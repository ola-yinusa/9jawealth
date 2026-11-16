export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface PillarItem {
  id: string;
  title: string;
  body: string;
}

export interface PathItem {
  id: string;
  location: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  specs: string[];
}

export interface SocialLink {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "About Olanrewaju", href: "#about" },
  { label: "Wealth Paths", href: "#paths" },
  { label: "Investment Guide", href: "/education" },
  { label: "Consultations", href: "/education#book" },
];

export const pillars: PillarItem[] = [
  {
    id: "clarity",
    title: "Clarity before commitment",
    body: "Review your savings buffer, daily spending habits, and protection gaps before allocating fresh capital.",
  },
  {
    id: "education",
    title: "Education over urgency",
    body: "Compare Nigerian real estate opportunities by title status, payment structure, and holding horizon.",
  },
  {
    id: "legacy",
    title: "Real assets built to endure",
    body: "Step into vetted residential plots or managed oil-palm estates structured for multi-year ownership.",
  },
];

export const paths: PathItem[] = [
  {
    id: "real-estate",
    location: "Resort Palm Estate · Ibeju Lekki",
    title: "Explore Lekki Avana Signature plots and payment plans.",
    body: "Compare 300, 500, 600 and 1,000 SQM plots in a 3,000-palm-tree estate with completed gatehouse infrastructure, physical allocation underway, and 6- to 12-month payment plans.",
    cta: "Review Lekki Avana Signature",
    href: "https://signature.9jawealth.com/",
    image: "/images/lekki-avana-gatehouse.webp",
    imageWidth: 1280,
    imageHeight: 719,
    imageAlt: "Completed gatehouse construction and estate grounds at Lekki Avana Signature in Ibeju Lekki",
    specs: ["300 / 500 / 600 / 1,000 SQM", "6–12 month plans", "Physical allocation underway"],
  },
  {
    id: "agro-real-estate",
    location: "Agro Real Estate · Ogun State",
    title: "Own registered oil-palm land that earns for decades at PalmVille.",
    body: "A fully managed oil palm plantation in Obafemi-Owode, Ogun State. Pay once for permanent land ownership with Registered Survey and Deed of Assignment while expert agronomists manage the harvest.",
    cta: "Explore PalmVille Plantation",
    href: "https://palmville.9jawealth.com/",
    image: "/images/onsite.webp",
    imageWidth: 900,
    imageHeight: 1200,
    imageAlt: "Olanrewaju holding freshly harvested oil palm fruit bunches on site at PalmVille in Ogun State",
    specs: ["Registered Survey & Deed", "Agronomist-managed harvest", "Obafemi-Owode, Ogun"],
  },
];

export const footerLinks = {
  navigation: [
    { label: "Financial Assessment", href: "#quiz" },
    ...navItems,
  ],
  connect: [
    { label: "Book 1-on-1 Consultation", href: "/education#book", external: false },
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

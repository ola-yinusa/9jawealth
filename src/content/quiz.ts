export type QuizSection = "A" | "B" | "C" | "D";
export type StandardAnswer = "YES" | "NO" | "I DON'T KNOW";

export interface QuizQuestion {
  id: number;
  text: string;
  type: "standard" | "custom";
  section: QuizSection;
  options?: string[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export const standardOptions: StandardAnswer[] = ["YES", "NO", "I DON'T KNOW"];

export const quizQuestions: QuizQuestion[] = [
  { id: 1, text: "Do you know your present financial condition or net worth?", type: "standard", section: "A" },
  { id: 2, text: "Are you satisfied with your present financial condition?", type: "standard", section: "A" },
  { id: 3, text: "Are you aware of simple ways to increase your net worth?", type: "standard", section: "A" },
  { id: 4, text: "Do you have 6 months of living expenses saved if you lost your job today?", type: "standard", section: "A" },
  { id: 5, text: "Do you save money on a regular basis?", type: "standard", section: "A" },
  { id: 6, text: "Have you formed the habit of saving?", type: "standard", section: "A" },
  { id: 7, text: "Do you have a well-defined, documented financial goal?", type: "standard", section: "A" },
  { id: 8, text: "Do you have a bank account?", type: "standard", section: "A" },
  { id: 9, text: "Do you reconcile your bank statement every month?", type: "standard", section: "A" },
  {
    id: 10,
    text: "Do you keep a record of your income and expenditure?",
    type: "standard",
    section: "B",
    sectionTitle: "Section B",
    sectionSubtitle: "Now we move from awareness to day-to-day money management.",
  },
  { id: 11, text: "Do you know how much you spend each month?", type: "standard", section: "B" },
  { id: 12, text: "Do you spend less than you earn?", type: "standard", section: "B" },
  { id: 13, text: "Do you have a household budget and manage it successfully?", type: "standard", section: "B" },
  { id: 14, text: "Do you avoid major credit purchases?", type: "standard", section: "B" },
  { id: 15, text: "Do you take advantage of investment opportunities that come your way?", type: "standard", section: "B" },
  {
    id: 16,
    text: "Do you have investments that reduce your taxable income?",
    type: "standard",
    section: "C",
    sectionTitle: "Section C",
    sectionSubtitle: "Next is the longer horizon: protection, ownership, and future planning.",
  },
  { id: 17, text: "Do you diversify your investments?", type: "standard", section: "C" },
  { id: 18, text: "Are you satisfied with the return your investments contribute to your income?", type: "standard", section: "C" },
  { id: 19, text: "Do you have a brilliant financial advisor or team?", type: "standard", section: "C" },
  { id: 20, text: "Do you have enough life insurance coverage?", type: "standard", section: "C" },
  { id: 21, text: "Do you have a plan for your children's education?", type: "standard", section: "C" },
  { id: 22, text: "Do you own a house?", type: "standard", section: "C" },
  { id: 23, text: "Do you have plans to retire in comfort?", type: "standard", section: "C" },
  { id: 24, text: "Have you prepared your will?", type: "standard", section: "C" },
  { id: 25, text: "Are you in control of your financial future?", type: "standard", section: "C" },
  { id: 26, text: "Are you satisfied with the contribution you've made in the world?", type: "standard", section: "C" },
  {
    id: 27,
    text: "What is your current primary source of income?",
    type: "custom",
    options: ["Job", "Career", "Business", "Multiple streams"],
    section: "D",
    sectionTitle: "Section D",
    sectionSubtitle: "Finally, we look at your earning structure and near-term next moves.",
  },
  { id: 28, text: "Does your income give you seed money to invest in other streams?", type: "custom", options: ["Yes", "No", "Sometimes"], section: "D" },
  { id: 29, text: "What percentage of your income are you currently saving or investing?", type: "custom", options: ["Less than 5%", "5–15%", "15–30%", "More than 30%"], section: "D" },
  { id: 30, text: "Are you actively working to build additional income streams?", type: "custom", options: ["Yes, actively", "Thinking about it", "Not yet"], section: "D" },
  { id: 31, text: "What is one realistic stream you could begin exploring in the next 30 days?", type: "custom", options: ["Real estate", "Forex trading", "A side business", "Not sure yet"], section: "D" },
];

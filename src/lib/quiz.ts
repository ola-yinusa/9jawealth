import type { QuizQuestion, StandardAnswer } from "@/src/content/quiz";

export type Answer = StandardAnswer | string;

export interface QuizResult {
  bracket: string;
  summary: string;
  recommendation: string;
}

export function getChoiceSet(question: QuizQuestion): string[] {
  return question.type === "standard" ? ["YES", "NO", "I DON'T KNOW"] : question.options ?? [];
}

export function getQuizResult(answers: Record<number, Answer>): QuizResult {
  const score = Object.entries(answers).reduce((acc, [id, value]) => {
    const questionId = Number.parseInt(id, 10);
    if (questionId <= 26 && (value === "NO" || value === "I DON'T KNOW")) {
      return acc + 1;
    }
    return acc;
  }, 0);

  if (score <= 4) {
    return {
      bracket: "Good shape",
      summary: "You already show strong financial awareness and structure in several core areas.",
      recommendation: "Your next gain is likely in sharpening your strategy, not starting from scratch.",
    };
  }

  if (score <= 10) {
    return {
      bracket: "On the right track",
      summary: "There is a meaningful base here, but a few habits and planning gaps are limiting momentum.",
      recommendation: "A clearer system and more disciplined follow-through could materially change your trajectory.",
    };
  }

  if (score <= 12) {
    return {
      bracket: "Weak pulse",
      summary: "You are carrying enough uncertainty that your financial progress may feel slower or less stable than it should.",
      recommendation: "The highest-value next step is clarity: know where you stand, what matters most, and what to fix first.",
    };
  }

  return {
    bracket: "Needs attention",
    summary: "Several foundational systems appear underdeveloped, which means opportunity may be getting lost before it compounds.",
    recommendation: "A guided reset around awareness, discipline, and planning would likely create the biggest improvement.",
  };
}

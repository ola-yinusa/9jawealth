import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeQuizResult,
  countStandardAnswers,
  escapeHtml,
  getFirstMissingQuestionId,
  getQuizBreakdown,
  isValidEmail,
  maskEmail,
  normalizeName,
  validateSubmission,
} from "../src/lib/assessment.ts";
import { getQuizResult } from "../src/lib/quiz.ts";

function fullAnswers(overrides: Record<string, string> = {}): Record<string, string> {
  const answers: Record<string, string> = {};
  for (let id = 1; id <= 26; id++) answers[String(id)] = "YES";
  answers["27"] = "Business";
  answers["28"] = "Yes";
  answers["29"] = "5–15%";
  answers["30"] = "Thinking about it";
  answers["31"] = "A side business";
  return { ...answers, ...overrides };
}

function answersWithGaps(gapCount: number): Record<string, string> {
  const overrides: Record<string, string> = {};
  for (let i = 1; i <= gapCount; i++) {
    overrides[String(i)] = i % 2 === 0 ? "I DON'T KNOW" : "NO";
  }
  return fullAnswers(overrides);
}

test("escapeHtml neutralises markup for email interpolation", () => {
  assert.equal(
    escapeHtml(`<script>alert("x")</script>'&'`),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&#39;&amp;&#39;",
  );
});

test("isValidEmail accepts normal addresses and rejects junk", () => {
  assert.equal(isValidEmail("ada@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail(""), false);
});

test("normalizeName trims and collapses whitespace", () => {
  assert.equal(normalizeName("  Ada   Obi "), "Ada Obi");
  assert.equal(normalizeName(42), "");
});

test("maskEmail hides the local part", () => {
  assert.equal(maskEmail("ada@example.com"), "a***@example.com");
  assert.equal(maskEmail("broken"), "***");
});

test("computeQuizResult and getQuizResult use balanced brackets across 0-26 gaps", () => {
  for (const [gaps, expected] of [
    [0, "Good shape"],
    [4, "Good shape"],
    [5, "On the right track"],
    [10, "On the right track"],
    [11, "Weak pulse"],
    [13, "Weak pulse"],
    [17, "Weak pulse"],
    [18, "Needs attention"],
    [26, "Needs attention"],
  ] as const) {
    const sample = answersWithGaps(gaps);
    assert.equal(computeQuizResult(sample).bracket, expected);
    assert.equal(getQuizResult(sample).bracket, expected);
  }
});

test("computeQuizResult ignores section-D custom answers", () => {
  const answers = fullAnswers({ "27": "Not sure yet", "31": "Agro-real estate" });
  assert.equal(computeQuizResult(answers).bracket, "Good shape");
  assert.equal(countStandardAnswers(answers), 26);
});

test("getQuizBreakdown computes section scores and matched recommended paths", () => {
  const answers = fullAnswers({
    "1": "NO",
    "2": "I DON'T KNOW",
    "10": "NO",
    "16": "I DON'T KNOW",
    "20": "NO",
    "27": "Career",
    "31": "Agro-real estate (e.g. PalmVille)",
  });

  const palmvilleBreakdown = getQuizBreakdown(answers);
  assert.equal(palmvilleBreakdown.totalScore, 5);
  assert.equal(palmvilleBreakdown.incomeSource, "Career");
  assert.equal(palmvilleBreakdown.focusGoal, "Agro-real estate (e.g. PalmVille)");
  assert.deepEqual(palmvilleBreakdown.sections, [
    { section: "A", label: "Awareness", answered: 9, total: 9, gaps: 2 },
    { section: "B", label: "Daily discipline", answered: 6, total: 6, gaps: 1 },
    { section: "C", label: "Future planning", answered: 11, total: 11, gaps: 2 },
    { section: "D", label: "Income direction", answered: 5, total: 5, gaps: 0 },
  ]);
  assert.equal(palmvilleBreakdown.recommendedPath.id, "palmville");
  assert.equal(palmvilleBreakdown.recommendedPath.href, "https://palmville.9jawealth.com/");
  assert.equal(palmvilleBreakdown.recommendedPath.guideHref, "/education#featured-offerings");

  const realEstateBreakdown = getQuizBreakdown(fullAnswers({ "31": "Real estate" }));
  assert.equal(realEstateBreakdown.recommendedPath.id, "signature");
  assert.equal(realEstateBreakdown.recommendedPath.href, "https://signature.9jawealth.com/");
  assert.equal(realEstateBreakdown.recommendedPath.guideHref, "/education#featured-offerings");

  const consultationBreakdown = getQuizBreakdown(fullAnswers({ "31": "Not sure yet" }));
  assert.equal(consultationBreakdown.recommendedPath.id, "consultation");
  assert.equal(consultationBreakdown.recommendedPath.href, "/education#book");
  assert.equal(consultationBreakdown.recommendedPath.guideHref, "/education#book");
});

test("getFirstMissingQuestionId returns first missing or invalid question ID", () => {
  assert.equal(getFirstMissingQuestionId(fullAnswers()), null);

  const missingMiddle = fullAnswers();
  delete missingMiddle["14"];
  assert.equal(getFirstMissingQuestionId(missingMiddle), 14);

  const invalidStandard = fullAnswers({ "5": "MAYBE" });
  assert.equal(getFirstMissingQuestionId(invalidStandard), 5);

  const missingSectionD = fullAnswers({ "31": "   " });
  assert.equal(getFirstMissingQuestionId(missingSectionD), 31);
});

test("validateSubmission accepts a complete payload", () => {
  const outcome = validateSubmission({
    name: "  Ada Obi ",
    email: "Ada@Example.com",
    answers: fullAnswers(),
    submittedAt: new Date().toISOString(),
  });
  assert.equal(outcome.ok, true);
  assert.deepEqual(outcome.errors, []);
  assert.equal(outcome.value?.name, "Ada Obi");
  assert.equal(outcome.value?.email, "ada@example.com");
});

test("validateSubmission rejects bad name, email and incomplete answers", () => {
  const outcome = validateSubmission({
    name: "A",
    email: "not-an-email",
    answers: { "1": "YES" },
  });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.value, null);
  assert.ok(outcome.errors.length >= 3);
});

test("validateSubmission rejects unknown ids, malformed keys, invalid standard choices, and oversized values", () => {
  const answers = fullAnswers({ "99": "YES", "1a": "YES", "02": "YES", "3": "MAYBE", "1": "x".repeat(61) });
  const outcome = validateSubmission({
    name: "Ada Obi",
    email: "ada@example.com",
    answers,
  });
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((e) => e.includes("Unknown question id: 99")));
  assert.ok(outcome.errors.some((e) => e.includes("Unknown question id: 1a")));
  assert.ok(outcome.errors.some((e) => e.includes("Unknown question id: 02")));
  assert.ok(outcome.errors.some((e) => e.includes("Invalid answer for question 3")));
  assert.ok(outcome.errors.some((e) => e.includes("too long")));
});

test("validateSubmission falls back to server time for out-of-range timestamps", () => {
  const before = Date.now();
  const outcome = validateSubmission({
    name: "Ada Obi",
    email: "ada@example.com",
    answers: fullAnswers(),
    submittedAt: "not-a-date",
  });
  assert.equal(outcome.ok, true);
  const parsed = new Date(outcome.value!.submittedAt).getTime();
  assert.ok(parsed >= before - 1000 && parsed <= Date.now() + 1000);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeQuizResult,
  countStandardAnswers,
  escapeHtml,
  isValidEmail,
  maskEmail,
  normalizeName,
  validateSubmission,
} from "../src/lib/assessment.ts";

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

test("computeQuizResult brackets follow gap counts", () => {
  assert.equal(computeQuizResult(fullAnswers()).bracket, "Good shape");

  const fiveGaps = fullAnswers();
  for (let i = 1; i <= 5; i++) fiveGaps[String(i)] = "NO";
  assert.equal(computeQuizResult(fiveGaps).bracket, "On the right track");

  const elevenGaps = fullAnswers();
  for (let i = 1; i <= 11; i++) elevenGaps[String(i)] = "I DON'T KNOW";
  assert.equal(computeQuizResult(elevenGaps).bracket, "Weak pulse");

  const thirteenGaps = fullAnswers();
  for (let i = 1; i <= 13; i++) thirteenGaps[String(i)] = "NO";
  assert.equal(computeQuizResult(thirteenGaps).bracket, "Needs attention");
});

test("computeQuizResult ignores section-D custom answers", () => {
  const answers = fullAnswers({ "27": "Not sure yet", "31": "Forex trading" });
  assert.equal(computeQuizResult(answers).bracket, "Good shape");
  assert.equal(countStandardAnswers(answers), 26);
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

test("validateSubmission rejects unknown ids and oversized values", () => {
  const answers = fullAnswers({ "99": "YES", "1": "x".repeat(61) });
  const outcome = validateSubmission({
    name: "Ada Obi",
    email: "ada@example.com",
    answers,
  });
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((e) => e.includes("Unknown question id")));
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

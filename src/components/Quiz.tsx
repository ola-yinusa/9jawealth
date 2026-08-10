import type { FormEvent } from "react";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { quizQuestions } from "@/src/content/quiz";
import { getChoiceSet, getQuizResult, type Answer } from "@/src/lib/quiz";
import { submitAssessment } from "@/src/lib/submissions";

const sectionNames = {
  A: "Awareness",
  B: "Daily discipline",
  C: "Future planning",
  D: "Income direction",
} as const;

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [isCheckpoint, setIsCheckpoint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [submissionReference, setSubmissionReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const helperId = useId();

  const currentQuestion = quizQuestions[currentIndex];
  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;
  const result = useMemo(() => getQuizResult(answers), [answers]);

  const handleAnswer = (answer: Answer) => {
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: answer }));

    window.setTimeout(() => {
      if (currentIndex < quizQuestions.length - 1) {
        const nextQuestion = quizQuestions[currentIndex + 1];
        if (nextQuestion.sectionTitle) {
          setIsCheckpoint(true);
          window.setTimeout(() => {
            setIsCheckpoint(false);
            setCurrentIndex((previous) => previous + 1);
          }, prefersReducedMotion ? 100 : 950);
        } else {
          setCurrentIndex((previous) => previous + 1);
        }
      } else {
        setIsFinished(true);
      }
    }, prefersReducedMotion ? 80 : 220);
  };

  const handleAssessmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await submitAssessment({
        name: formData.name.trim(),
        email: formData.email.trim(),
        answers: Object.fromEntries(
          Object.entries(answers).map(([key, value]) => [key, String(value)]),
        ),
        result,
        submittedAt: new Date().toISOString(),
      });

      setSubmissionReference(response.reference);
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to submit the assessment right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="quiz" className="py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-3">Your financial clarity assessment</p>
          <h2 className="balance-text mb-4 text-4xl font-medium leading-tight text-navy md:text-5xl">
            Before you choose a path, know your starting point.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ink">
            Take the 2-minute financial clarity assessment to understand where you stand before making any decisions.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)]">
          <aside className="surface-panel card-outline rounded-[2rem] border border-border p-6 md:p-7">
            <p className="eyebrow mb-3">How it works</p>
            <ol className="space-y-6">
              <li>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-navy">01. Reflect</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">You answer structured questions around awareness, habits, planning, and income direction.</p>
              </li>
              <li>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-navy">02. Understand</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">The experience derives a bracket and explanatory summary so you leave with a clear sense of where you stand.</p>
              </li>
              <li>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-navy">03. Receive</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">Your results are delivered to your inbox along with a recommended next step for your financial journey.</p>
              </li>
            </ol>
            <div className="mt-8 rounded-[1.5rem] border border-gold/16 bg-gold/8 px-5 py-4">
              <p className="text-sm font-semibold text-navy">What happens after submission</p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Your assessment results are emailed to you immediately so you can review and act on them at your own pace.
              </p>
            </div>
          </aside>

          <div className="deep-panel overflow-hidden rounded-[2.3rem] border border-white/8 shadow-[0_34px_90px_rgba(20,33,51,0.18)]">
            {!isFinished ? (
              <div className="border-b border-white/10 px-6 py-5 md:px-8">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-2 text-gold-light">Assessment progress</p>
                    <p className="text-sm text-white/66">
                      Section {currentQuestion.section}: {sectionNames[currentQuestion.section]}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white/82">
                    {currentIndex + 1} / {quizQuestions.length}
                  </p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.35 }}
                    style={{ transformOrigin: "left" }}
                    className="h-full rounded-full bg-gold"
                  />
                </div>
              </div>
            ) : null}

            <div className="p-6 md:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                {!isFinished ? (
                  isCheckpoint ? (
                    <motion.div
                      key="checkpoint"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex min-h-[28rem] flex-col items-center justify-center text-center"
                    >
                      <p className="eyebrow mb-3 text-gold-light">{quizQuestions[currentIndex + 1].sectionTitle}</p>
                      <h3 className="balance-text mb-4 max-w-[12ch] text-5xl font-medium italic text-white">
                        {sectionNames[quizQuestions[currentIndex + 1].section]}
                      </h3>
                      <p className="max-w-xl text-lg leading-relaxed text-white/68">
                        {quizQuestions[currentIndex + 1].sectionSubtitle}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentQuestion.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: prefersReducedMotion ? 0.12 : 0.35 }}
                      className="min-h-[28rem]"
                    >
                      <p className="mb-6 text-sm uppercase tracking-[0.18em] text-white/54">
                        Question {currentIndex + 1} of {quizQuestions.length}
                      </p>
                      <h3 className="balance-text mb-10 max-w-3xl text-2xl font-medium leading-[1.25] text-white md:text-[2rem]">
                        {currentQuestion.text}
                      </h3>
                      <div className="grid gap-3">
                        {getChoiceSet(currentQuestion).map((option) => {
                          const isSelected = answers[currentQuestion.id] === option;

                          return (
                            <motion.button
                              key={option}
                              type="button"
                              whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                              onClick={() => handleAnswer(option)}
                              className={`focus-ring min-h-11 rounded-[1.4rem] border px-5 py-4 text-left transition-all ${isSelected
                                ? "border-gold bg-gold text-navy"
                                : "border-white/12 bg-white/6 text-white/88 hover:border-gold/70 hover:bg-white/10"
                                }`}
                            >
                              <span className="block font-display text-[15px] font-semibold uppercase tracking-[0.08em]">
                                {option}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.88fr)]"
                  >
                    <div>
                      <p className="eyebrow mb-3 text-gold-light">Your result</p>
                      <h3 className="mb-4 text-4xl font-medium italic text-white">
                        {result.bracket}
                      </h3>
                      <p className="mb-4 max-w-xl text-lg leading-relaxed text-white/78">
                        {result.summary}
                      </p>
                      <p className="max-w-xl text-base leading-relaxed text-white/62">
                        {result.recommendation}
                      </p>
                      <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gold-light">
                          Next step
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/68">
                          Submit the form to receive your full assessment results by email and start your financial path.
                        </p>
                      </div>
                    </div>

                    <div className="surface-panel card-outline rounded-[2rem] border border-border p-6 md:p-7">
                      <h4 className="mb-2 text-2xl font-medium text-navy">Save your assessment</h4>
                      <p id={helperId} className="mb-6 text-sm leading-relaxed text-ink">
                        Fill in your details to receive your assessment results by email.
                      </p>

                      <form onSubmit={handleAssessmentSubmit} className="space-y-4" aria-describedby={helperId}>
                        <div>
                          <label htmlFor="assessment-name" className="mb-2 block text-sm font-semibold text-navy">
                            Full name
                          </label>
                          <input
                            id="assessment-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                            className="focus-ring min-h-11 w-full rounded-[1rem] border border-border bg-white px-4 py-3 text-navy placeholder:text-muted"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label htmlFor="assessment-email" className="mb-2 block text-sm font-semibold text-navy">
                            Email address
                          </label>
                          <input
                            id="assessment-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
                            className="focus-ring min-h-11 w-full rounded-[1rem] border border-border bg-white px-4 py-3 text-navy placeholder:text-muted"
                            placeholder="Enter your email address"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="focus-ring min-h-11 w-full rounded-full bg-navy px-5 py-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white"
                        >
                          {isSubmitting ? "Saving assessment..." : "Save my assessment"}
                        </button>
                      </form>

                      {submissionError ? (
                        <div className="mt-5 rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-4">
                          <p className="text-sm font-semibold text-red-700">Submission issue</p>
                          <p className="mt-2 text-sm leading-relaxed text-red-600">
                            {submissionError}
                          </p>
                        </div>
                      ) : null}

                      {submissionReference ? (
                        <div className="mt-5 rounded-[1.4rem] border border-gold/20 bg-gold/10 px-4 py-4">
                          <p className="text-sm font-semibold text-navy">Assessment received</p>
                          <p className="mt-2 text-sm leading-relaxed text-ink">
                            Your assessment has been saved and results emailed to you. Reference:{" "}
                            <span className="font-semibold">{submissionReference}</span>.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

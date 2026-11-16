import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Lock,
  Mail,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { quizQuestions, quizSectionLabels, type QuizSection } from "@/src/content/quiz";
import {
  getChoiceSet,
  getFirstMissingQuestionId,
  getQuizBreakdown,
  getQuizResult,
  type Answer,
  type QuizResult,
} from "@/src/lib/quiz";
import { submitAssessment, type SubmissionResponse } from "@/src/lib/submissions";

const STORAGE_KEY = "9jawealth-quiz-v1";
const RESULT_STORAGE_KEY = "9jawealth-quiz-result-v1";
const CONFIRMED_STORAGE_KEY = "9jawealth-quiz-confirmed-v1";
const WHATSAPP_URL = "https://wa.link/fz5g34";
const SUPPORT_EMAIL = "ola.yinusa.lanre@gmail.com";

interface PersistedQuiz {
  answers: Record<number, Answer>;
  currentIndex: number;
  isFinished: boolean;
  formData: { name: string; email: string };
  startedAt: string;
}

interface PersistedConfirmation {
  reference: string;
  email: string;
  result: QuizResult;
  answers: Record<number, Answer>;
  emailSent: boolean;
  warning: string | null;
}

function loadPersistedQuiz(): PersistedQuiz | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedQuiz>;
    if (!parsed || typeof parsed !== "object" || !parsed.answers) return null;

    const answers = parsed.answers as Record<number, Answer>;
    const rawIndex =
      typeof parsed.currentIndex === "number" &&
      parsed.currentIndex >= 0 &&
      parsed.currentIndex < quizQuestions.length
        ? Math.floor(parsed.currentIndex)
        : 0;

    const missingId = getFirstMissingQuestionId(answers);
    let isFinished = parsed.isFinished === true && missingId === null;
    let currentIndex = rawIndex;

    if (parsed.isFinished === true && missingId !== null) {
      const missingIdx = quizQuestions.findIndex((q) => q.id === missingId);
      if (missingIdx >= 0) {
        currentIndex = missingIdx;
      }
      isFinished = false;
    }

    return {
      answers,
      currentIndex,
      isFinished,
      formData: {
        name: typeof parsed.formData?.name === "string" ? parsed.formData.name.slice(0, 80) : "",
        email: typeof parsed.formData?.email === "string" ? parsed.formData.email.slice(0, 254) : "",
      },
      startedAt:
        typeof parsed.startedAt === "string" && parsed.startedAt
          ? parsed.startedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function loadPersistedConfirmation(): PersistedConfirmation | null {
  try {
    const raw = window.sessionStorage.getItem(CONFIRMED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedConfirmation>;
    if (
      !parsed ||
      typeof parsed.reference !== "string" ||
      !parsed.reference ||
      !parsed.result ||
      !parsed.answers
    ) {
      return null;
    }
    return {
      reference: parsed.reference,
      email: typeof parsed.email === "string" ? parsed.email : "",
      result: parsed.result,
      answers: parsed.answers,
      emailSent: parsed.emailSent !== false,
      warning: typeof parsed.warning === "string" ? parsed.warning : null,
    };
  } catch {
    return null;
  }
}

function getSectionReadinessLabel(section: QuizSection, total: number, gaps: number, focusGoal: string): string {
  if (section === "D") {
    return focusGoal ? `Focus: ${focusGoal}` : "Goal captured";
  }
  const safeTotal = Math.max(total, 1);
  const gapRatio = gaps / safeTotal;
  if (gapRatio <= 0.25) return "Strong";
  if (gapRatio <= 0.55) return "Developing";
  return "Priority gap";
}

export default function Quiz() {
  const initialConfirmation = useMemo(() => loadPersistedConfirmation(), []);
  const initialPersisted = useMemo(
    () => (initialConfirmation ? null : loadPersistedQuiz()),
    [initialConfirmation],
  );

  const [currentIndex, setCurrentIndex] = useState(() => initialPersisted?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<Record<number, Answer>>(
    () => initialConfirmation?.answers ?? initialPersisted?.answers ?? {},
  );
  const [isCheckpoint, setIsCheckpoint] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFinished, setIsFinished] = useState(
    () => Boolean(initialConfirmation) || (initialPersisted?.isFinished ?? false),
  );
  const [formData, setFormData] = useState(
    () => initialPersisted?.formData ?? { name: "", email: "" },
  );
  const [startedAt, setStartedAt] = useState(
    () => initialPersisted?.startedAt ?? new Date().toISOString(),
  );
  const [honeypot, setHoneypot] = useState("");
  const [submissionReference, setSubmissionReference] = useState<string | null>(
    () => initialConfirmation?.reference ?? null,
  );
  const [submittedEmail, setSubmittedEmail] = useState<string>(
    () => initialConfirmation?.email ?? "",
  );
  const [submittedResult, setSubmittedResult] = useState<QuizResult | null>(
    () => initialConfirmation?.result ?? null,
  );
  const [emailSent, setEmailSent] = useState<boolean>(() => initialConfirmation?.emailSent ?? true);
  const [submissionWarning, setSubmissionWarning] = useState<string | null>(
    () => initialConfirmation?.warning ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [missingQuestionNotice, setMissingQuestionNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const prefersReducedMotion = useReducedMotion();
  const helperId = useId();
  const advanceTimerRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const focusPendingRef = useRef(false);
  const focusResultRef = useRef(false);
  const focusConfirmationRef = useRef(false);
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const confirmationHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const clearPendingAdvance = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingAdvance();
    };
  }, [clearPendingAdvance]);

  // Persist in-progress quiz only while unsubmitted; never rewrite STORAGE_KEY after submit.
  useEffect(() => {
    if (submissionReference) return;
    try {
      const payload: PersistedQuiz = { answers, currentIndex, isFinished, formData, startedAt };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage full or unavailable — quiz continues in memory.
    }
  }, [answers, currentIndex, isFinished, formData, startedAt, submissionReference]);

  const currentQuestion = quizQuestions[currentIndex] ?? quizQuestions[0];
  const upcomingQuestion = quizQuestions[currentIndex + 1];
  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;
  const computedResult = useMemo(() => getQuizResult(answers), [answers]);
  const activeResult = submittedResult ?? computedResult;
  const breakdown = useMemo(() => getQuizBreakdown(answers), [answers]);
  const firstMissingId = useMemo(() => getFirstMissingQuestionId(answers), [answers]);
  const isAllComplete = firstMissingId === null;
  const answeredCount = Object.keys(answers).length;

  const setQuestionHeadingRef = useCallback((el: HTMLHeadingElement | null) => {
    questionHeadingRef.current = el;
    if (el && focusPendingRef.current) {
      focusPendingRef.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  const setResultHeadingRef = useCallback((el: HTMLHeadingElement | null) => {
    resultHeadingRef.current = el;
    if (el && focusResultRef.current) {
      focusResultRef.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  const setConfirmationHeadingRef = useCallback((el: HTMLHeadingElement | null) => {
    confirmationHeadingRef.current = el;
    if (el && focusConfirmationRef.current) {
      focusConfirmationRef.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (isTransitioningRef.current || isCheckpoint || isFinished || submissionReference) {
        return;
      }
      const question = quizQuestions[currentIndex];
      if (!question) return;

      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setConfirmReset(false);
      setMissingQuestionNotice(null);
      clearPendingAdvance();

      const nextAnswers: Record<number, Answer> = { ...answers, [question.id]: answer };
      setAnswers(nextAnswers);

      const stepDelay = prefersReducedMotion ? 70 : 210;
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = null;

        if (currentIndex < quizQuestions.length - 1) {
          const nextIndex = currentIndex + 1;
          const nextQuestion = quizQuestions[nextIndex];
          if (!nextQuestion) {
            isTransitioningRef.current = false;
            setIsTransitioning(false);
            return;
          }

          if (nextQuestion.sectionTitle) {
            setIsCheckpoint(true);
            setLiveAnnouncement(
              `Section ${nextQuestion.section}: ${quizSectionLabels[nextQuestion.section]}. ${nextQuestion.sectionSubtitle ?? ""}`,
            );
            const checkpointDelay = prefersReducedMotion ? 110 : 880;
            advanceTimerRef.current = window.setTimeout(() => {
              advanceTimerRef.current = null;
              setIsCheckpoint(false);
              focusPendingRef.current = true;
              setCurrentIndex(nextIndex);
              isTransitioningRef.current = false;
              setIsTransitioning(false);
            }, checkpointDelay);
          } else {
            focusPendingRef.current = true;
            setCurrentIndex(nextIndex);
            isTransitioningRef.current = false;
            setIsTransitioning(false);
          }
        } else {
          const missingId = getFirstMissingQuestionId(nextAnswers);
          if (missingId !== null) {
            const missingIndex = quizQuestions.findIndex((q) => q.id === missingId);
            const safeIndex = missingIndex >= 0 ? missingIndex : 0;
            const message = `Question ${safeIndex + 1} still needs an answer before we prepare your diagnosis.`;
            setMissingQuestionNotice(message);
            setLiveAnnouncement(message);
            focusPendingRef.current = true;
            setCurrentIndex(safeIndex);
          } else {
            focusResultRef.current = true;
            setLiveAnnouncement("Assessment complete. Review your diagnosis summary and save your roadmap.");
            setIsFinished(true);
          }
          isTransitioningRef.current = false;
          setIsTransitioning(false);
        }
      }, stepDelay);
    },
    [
      answers,
      clearPendingAdvance,
      currentIndex,
      isCheckpoint,
      isFinished,
      prefersReducedMotion,
      submissionReference,
    ],
  );

  const handleBack = useCallback(() => {
    if (submissionReference) return;
    clearPendingAdvance();
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setConfirmReset(false);
    setMissingQuestionNotice(null);

    if (isCheckpoint) {
      setIsCheckpoint(false);
      focusPendingRef.current = true;
      return;
    }
    if (isFinished) {
      setIsFinished(false);
      focusPendingRef.current = true;
      return;
    }
    if (currentIndex > 0) {
      focusPendingRef.current = true;
      setCurrentIndex((previous) => Math.max(0, previous - 1));
    }
  }, [clearPendingAdvance, currentIndex, isCheckpoint, isFinished, submissionReference]);

  const handleJumpToResults = useCallback(() => {
    if (!isAllComplete) return;
    clearPendingAdvance();
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setIsCheckpoint(false);
    setMissingQuestionNotice(null);
    focusResultRef.current = true;
    setIsFinished(true);
  }, [clearPendingAdvance, isAllComplete]);

  const handleJumpToSection = useCallback(
    (section: QuizSection) => {
      if (submissionReference) return;
      const targetIndex = quizQuestions.findIndex((q) => q.section === section);
      if (targetIndex < 0) return;
      clearPendingAdvance();
      isTransitioningRef.current = false;
      setIsTransitioning(false);
      setIsCheckpoint(false);
      setIsFinished(false);
      setMissingQuestionNotice(null);
      focusPendingRef.current = true;
      setCurrentIndex(targetIndex);
    },
    [clearPendingAdvance, submissionReference],
  );

  const performRestart = useCallback(() => {
    clearPendingAdvance();
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(CONFIRMED_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    setAnswers({});
    setCurrentIndex(0);
    setIsCheckpoint(false);
    setIsFinished(false);
    setFormData({ name: "", email: "" });
    setStartedAt(new Date().toISOString());
    setHoneypot("");
    setSubmissionReference(null);
    setSubmittedEmail("");
    setSubmittedResult(null);
    setEmailSent(true);
    setSubmissionWarning(null);
    setSubmissionError(null);
    setMissingQuestionNotice(null);
    setConfirmReset(false);
    setLiveAnnouncement("Assessment reset to question 1.");
    focusPendingRef.current = true;
  }, [clearPendingAdvance]);

  const handleRestartRequest = () => {
    if (!submissionReference && answeredCount >= 3 && !confirmReset) {
      setConfirmReset(true);
      return;
    }
    performRestart();
  };

  const handleQuizKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
    ) {
      return;
    }
    if (isFinished || isCheckpoint || isTransitioningRef.current || submissionReference) return;

    const index = Number.parseInt(event.key, 10) - 1;
    if (!Number.isInteger(index) || index < 0 || index > 3) return;
    const choices = getChoiceSet(currentQuestion);
    if (index < choices.length) {
      event.preventDefault();
      handleAnswer(choices[index]);
    }
  };

  const handleAssessmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || submissionReference) return;

    const missingId = getFirstMissingQuestionId(answers);
    if (missingId !== null) {
      const missingIdx = quizQuestions.findIndex((q) => q.id === missingId);
      const safeIdx = missingIdx >= 0 ? missingIdx : 0;
      const notice = `Question ${safeIdx + 1} is still unanswered. Please answer it before submitting.`;
      setMissingQuestionNotice(notice);
      setLiveAnnouncement(notice);
      setIsFinished(false);
      focusPendingRef.current = true;
      setCurrentIndex(safeIdx);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    try {
      const response: SubmissionResponse = await submitAssessment({
        name: trimmedName,
        email: trimmedEmail,
        answers: Object.fromEntries(
          Object.entries(answers).map(([key, value]) => [key, String(value)]),
        ),
        result: computedResult,
        submittedAt: new Date().toISOString(),
        startedAt,
        website: honeypot,
      });

      const authoritativeResult = response.result ?? computedResult;
      const didSendEmail = response.emailSent !== false;
      const warningText =
        typeof response.warning === "string" && response.warning.trim()
          ? response.warning.trim()
          : !didSendEmail
            ? "Your assessment was saved, though email delivery could not be completed right now. Save your reference or message Olanrewaju on WhatsApp."
            : null;

      focusConfirmationRef.current = true;
      setSubmittedResult(authoritativeResult);
      setSubmittedEmail(trimmedEmail);
      setEmailSent(didSendEmail);
      setSubmissionWarning(warningText);
      setSubmissionReference(response.reference);
      setLiveAnnouncement(`Assessment received. Reference ${response.reference}.`);

      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.setItem(
          RESULT_STORAGE_KEY,
          JSON.stringify({
            bracket: authoritativeResult.bracket,
            focusGoal: breakdown.focusGoal || authoritativeResult.bracket,
            recommendedPathId: breakdown.recommendedPath.id,
            updatedAt: new Date().toISOString(),
          }),
        );
        window.sessionStorage.setItem(
          CONFIRMED_STORAGE_KEY,
          JSON.stringify({
            reference: response.reference,
            email: trimmedEmail,
            result: authoritativeResult,
            answers,
            emailSent: didSendEmail,
            warning: warningText,
          } satisfies PersistedConfirmation),
        );
      } catch {
        // Storage unavailable — confirmation stays rendered in memory.
      }
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to submit the assessment right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) return null;

  const choices = getChoiceSet(currentQuestion);
  const canGoBack = (isFinished && !submissionReference) || currentIndex > 0;
  const recommendedPath = breakdown.recommendedPath;
  const isExternalPath = recommendedPath.href.startsWith("https://");

  return (
    <section
      id="quiz"
      tabIndex={-1}
      onKeyDown={handleQuizKeyDown}
      className="scroll-mt-24 py-14 outline-none focus:outline-none md:py-24"
    >
      <div className="section-shell">
        <div className="mb-10 max-w-3xl">
          <h2 className="balance-text mb-3 text-4xl font-medium leading-tight text-navy md:text-5xl">
            Before you choose a path, know your starting point.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-ink">
            Take the 4-minute financial clarity assessment to measure your savings buffer, habits, protection, and earning direction.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(16rem,0.4fr)_minmax(0,1fr)]">
          <aside className="order-last surface-panel rounded-2xl border border-border p-6 md:p-7 xl:order-first">
            <h3 className="mb-5 text-2xl font-medium text-navy">
              How the assessment works
            </h3>
            <ol className="space-y-5">
              <li>
                <p className="font-display text-sm font-semibold text-navy">1. Answer 31 short questions</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  Covers awareness, daily discipline, future protection, and current income direction.
                </p>
              </li>
              <li>
                <p className="font-display text-sm font-semibold text-navy">2. See your readiness summary</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  Get an immediate snapshot across all four sections so you know where strengths and gaps sit.
                </p>
              </li>
              <li>
                <p className="font-display text-sm font-semibold text-navy">3. Get your full results</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  View your 4-section breakdown and recommended next step on screen and by email.
                </p>
              </li>
            </ol>

            {answeredCount > 0 && !submissionReference ? (
              <div className="mt-7 border-t border-border pt-6">
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={handleRestartRequest}
                    className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong px-5 py-2.5 font-display text-xs font-semibold text-navy hover:bg-white"
                  >
                    <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
                    <span>Start over</span>
                  </button>
                ) : (
                  <div className="space-y-2.5" role="group" aria-label="Confirm reset">
                    <button
                      type="button"
                      onClick={performRestart}
                      className="focus-ring min-h-11 w-full rounded-full bg-navy px-4 py-2.5 font-display text-xs font-semibold text-white hover:bg-navy-soft"
                    >
                      Are you sure? Reset answers
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="focus-ring min-h-11 w-full rounded-full border border-border-strong px-4 py-2 font-display text-xs font-semibold text-navy hover:bg-white"
                    >
                      Keep my answers
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </aside>

          <div
            className="order-first deep-panel overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(20,33,51,0.18)] xl:order-last"
          >
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {liveAnnouncement}
            </div>

            {!isFinished ? (
              <div className="border-b border-white/12 px-6 py-5 md:px-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gold-light">
                      Section {currentQuestion.section}: {quizSectionLabels[currentQuestion.section]}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-white/90" aria-live="polite">
                    {currentIndex + 1} / {quizQuestions.length}
                  </p>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-white/12"
                  role="progressbar"
                  aria-label="Assessment progress"
                  aria-valuemin={1}
                  aria-valuemax={quizQuestions.length}
                  aria-valuenow={currentIndex + 1}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.32 }}
                    style={{ transformOrigin: "left" }}
                    className="h-full rounded-full bg-gold"
                  />
                </div>
                {isAllComplete && !isCheckpoint ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <div className="flex flex-wrap gap-1.5" aria-label="Jump to section">
                      {(["A", "B", "C", "D"] as const).map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleJumpToSection(sec)}
                          className={`focus-ring-dark min-h-9 rounded-full px-3 py-1 text-xs font-semibold ${
                            currentQuestion.section === sec
                              ? "bg-gold text-navy"
                              : "bg-white/10 text-white/85 hover:bg-white/18"
                          }`}
                        >
                          {sec}: {quizSectionLabels[sec]}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleJumpToResults}
                      className="focus-ring-dark inline-flex min-h-9 items-center gap-1.5 rounded-full border border-gold-light/50 px-3.5 py-1 text-xs font-semibold text-gold-light hover:bg-gold hover:text-navy"
                    >
                      <span>Back to results</span>
                      <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="p-6 md:p-8 lg:p-10">
              {!isFinished ? (
                isCheckpoint && upcomingQuestion ? (
                  <motion.div
                    key="checkpoint"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0.08 : 0.2 }}
                    className="flex min-h-[26rem] flex-col items-center justify-center text-center"
                  >
                    <h3 className="balance-text mb-4 max-w-[16ch] text-4xl font-medium italic text-white md:text-5xl">
                      Section {upcomingQuestion.section}: {quizSectionLabels[upcomingQuestion.section]}
                    </h3>
                    <p className="max-w-xl text-lg leading-relaxed text-white/80">
                      {upcomingQuestion.sectionSubtitle}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentQuestion.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0.08 : 0.2 }}
                    className="min-h-[26rem]"
                  >
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <p className="text-sm font-medium tabular-nums text-white/75">
                          Question {currentIndex + 1} of {quizQuestions.length}
                        </p>
                        {currentIndex > 0 ? (
                          <button
                            type="button"
                            onClick={handleBack}
                            className="focus-ring-dark inline-flex min-h-11 items-center gap-2 rounded-full border border-white/22 px-4 py-2 text-xs font-semibold text-white/90 hover:border-gold-light hover:text-white"
                          >
                            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                            <span>Back</span>
                          </button>
                        ) : null}
                      </div>

                      {missingQuestionNotice ? (
                        <div
                          role="alert"
                          className="mb-5 rounded-xl border border-gold-light/45 bg-gold/15 px-4 py-3 text-sm text-gold-pale"
                        >
                          {missingQuestionNotice}
                        </div>
                      ) : null}

                      <h3
                        ref={setQuestionHeadingRef}
                        tabIndex={-1}
                        className="balance-text mb-8 max-w-3xl rounded-lg text-2xl font-medium leading-[1.25] text-white outline-none focus:outline-none md:text-[2rem]"
                      >
                        {currentQuestion.text}
                      </h3>

                      <div className="grid gap-3">
                        {choices.map((option, idx) => {
                          const isSelected = answers[currentQuestion.id] === option;

                          return (
                            <motion.button
                              key={option}
                              type="button"
                              disabled={isTransitioning}
                              whileHover={prefersReducedMotion || isTransitioning ? undefined : { y: -1 }}
                              whileTap={prefersReducedMotion || isTransitioning ? undefined : { scale: 0.99 }}
                              onClick={() => handleAnswer(option)}
                              aria-pressed={isSelected}
                              className={`focus-ring-dark flex min-h-12 items-center gap-3.5 rounded-xl border px-5 py-4 text-left transition-all disabled:cursor-wait ${
                                isSelected
                                  ? "border-gold bg-gold text-navy"
                                  : "border-white/16 bg-white/6 text-white/92 hover:border-gold-light/70 hover:bg-white/12"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                                  isSelected
                                    ? "bg-navy/15 text-navy"
                                    : "bg-white/12 text-white/80"
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="font-display text-[15px] font-semibold tracking-wide">
                                {option}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>

                      <p className="mt-5 text-xs text-white/68">
                        Keyboard tip: press 1–{choices.length} to select an answer.
                      </p>
                    </motion.div>
                  )
                ) : !submissionReference ? (
                  <motion.div
                    key="diagnosis-teaser"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-8 xl:grid-cols-[minmax(0,0.96fr)_minmax(18rem,0.88fr)]"
                  >
                    <div>
                      <h3
                        ref={setResultHeadingRef}
                        tabIndex={-1}
                        className="mb-3 text-3xl font-medium italic text-white outline-none focus:outline-none md:text-4xl"
                      >
                        Your result: {activeResult.bracket}
                      </h3>
                      <p className="mb-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
                        {activeResult.summary}
                      </p>

                      <div className="mb-6">
                        <p className="mb-3 text-xs font-display font-semibold uppercase tracking-[0.16em] text-gold-light">
                          Section overview
                        </p>
                        <ul className="flex flex-wrap gap-2.5">
                          {breakdown.sections.map((section) => {
                            const status = getSectionReadinessLabel(
                              section.section,
                              section.total,
                              section.gaps,
                              breakdown.focusGoal,
                            );

                            return (
                              <li
                                key={section.section}
                                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-3.5 py-2 text-xs text-white/92"
                              >
                                <span className="font-semibold text-gold-light">{section.label}:</span>
                                <span>{status}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="border-t border-white/14 pt-5">
                        <div className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80">
                          <Lock size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-gold-light" />
                          <p>
                            Enter your name and email to view your full section-by-section score and get a copy of your results by email.
                          </p>
                        </div>
                      </div>

                      {canGoBack ? (
                        <button
                          type="button"
                          onClick={handleBack}
                          className="focus-ring-dark mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/22 px-5 py-2.5 text-xs font-semibold text-white/90 hover:border-gold-light hover:text-white"
                        >
                          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                          <span>Review my answers</span>
                        </button>
                      ) : null}
                    </div>

                    <div className="surface-panel rounded-2xl p-6 text-navy md:p-7">
                      <h4 className="mb-2 text-2xl font-medium text-navy">
                        Where should we send your results?
                      </h4>
                      <p id={helperId} className="mb-6 text-sm leading-relaxed text-ink">
                        View your full score immediately on screen and receive a copy in your inbox.
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
                            minLength={2}
                            maxLength={80}
                            value={formData.name}
                            onChange={(event) =>
                              setFormData((previous) => ({ ...previous, name: event.target.value }))
                            }
                            className="focus-ring min-h-11 w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-navy placeholder:text-muted"
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
                            maxLength={254}
                            value={formData.email}
                            onChange={(event) =>
                              setFormData((previous) => ({ ...previous, email: event.target.value }))
                            }
                            className="focus-ring min-h-11 w-full rounded-xl border border-border-strong bg-white px-4 py-3 text-navy placeholder:text-muted"
                            placeholder="Enter your email address"
                          />
                        </div>

                        {/* Honeypot — hidden from humans, catches bots */}
                        <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
                          <label htmlFor="assessment-website">Website</label>
                          <input
                            id="assessment-website"
                            name="website"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(event) => setHoneypot(event.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="focus-ring min-h-12 w-full rounded-full bg-navy px-5 py-3.5 font-display text-sm font-semibold text-white hover:bg-navy-soft disabled:opacity-60"
                        >
                          {isSubmitting ? "Saving your results..." : "See & Email My Results"}
                        </button>
                      </form>

                      {submissionError ? (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-4" role="alert">
                          <p className="text-sm font-semibold text-red-900">Unable to send right now</p>
                          <p className="mt-1.5 text-sm leading-relaxed text-red-800">
                            {submissionError}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                            <a
                              href={WHATSAPP_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus-ring inline-flex min-h-9 items-center gap-1.5 text-navy underline hover:text-gold-darker"
                            >
                              <MessageCircle size={14} strokeWidth={2} aria-hidden="true" />
                              <span>Message on WhatsApp</span>
                            </a>
                            <a
                              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("9jawealth Financial Clarity Assessment")}`}
                              className="focus-ring inline-flex min-h-9 items-center gap-1.5 text-navy underline hover:text-gold-darker"
                            >
                              <Mail size={14} strokeWidth={2} aria-hidden="true" />
                              <span>Email {SUPPORT_EMAIL}</span>
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="unlocked-confirmation"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,0.9fr)]"
                  >
                    <div>
                      <h3
                        ref={setConfirmationHeadingRef}
                        tabIndex={-1}
                        className="mb-3 text-3xl font-medium italic text-white outline-none focus:outline-none md:text-4xl"
                      >
                        Your assessment results: {activeResult.bracket}
                      </h3>
                      <p className="mb-3 max-w-xl text-base leading-relaxed text-white/88">
                        {activeResult.summary}
                      </p>
                      <p className="mb-7 max-w-xl text-sm leading-relaxed text-gold-light">
                        {activeResult.recommendation}
                      </p>

                      <div className="space-y-4 border-t border-white/14 pt-6">
                        {breakdown.sections.map((section) => {
                          const isSectionD = section.section === "D";
                          const solidCount = Math.max(0, section.total - section.gaps);
                          const strengthPct = isSectionD
                            ? 100
                            : Math.round((solidCount / Math.max(section.total, 1)) * 100);

                          return (
                            <div key={section.section} className="space-y-1.5">
                              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                                <span className="font-semibold text-white">
                                  Section {section.section}: {section.label}
                                </span>
                                <span className="text-xs font-medium tabular-nums text-white/78">
                                  {isSectionD
                                    ? `${breakdown.incomeSource || "Income"} · ${breakdown.focusGoal || "Exploring options"}`
                                    : `${solidCount} of ${section.total} solid · ${section.gaps} ${section.gaps === 1 ? "gap" : "gaps"}`}
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/12">
                                <div
                                  className="h-full rounded-full bg-gold-light"
                                  style={{ width: `${strengthPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="surface-panel rounded-2xl p-6 text-navy md:p-7">
                      <div role="status" className="border-b border-border pb-5">
                        {emailSent && !submissionWarning ? (
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-palm" />
                            <div>
                              <p className="text-sm font-semibold text-navy">Report saved and emailed</p>
                              <p className="mt-1 text-sm leading-relaxed text-ink">
                                {submittedEmail ? `Sent to ${submittedEmail}. ` : ""}
                                Reference:{" "}
                                <span className="font-semibold tabular-nums text-navy">{submissionReference}</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-gold-darker" />
                            <div>
                              <p className="text-sm font-semibold text-navy">Assessment saved (email delayed)</p>
                              <p className="mt-1 text-sm leading-relaxed text-ink">
                                {submissionWarning}{" "}
                                Reference:{" "}
                                <span className="font-semibold tabular-nums text-navy">{submissionReference}</span>
                              </p>
                              <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="focus-ring mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-navy underline hover:text-gold-darker"
                              >
                                <MessageCircle size={14} strokeWidth={2} aria-hidden="true" />
                                <span>Request report copy on WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="py-5">
                        <h4 className="text-2xl font-medium text-navy">
                          Recommended next step: {recommendedPath.title}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-ink">
                          {recommendedPath.reason}
                        </p>

                        <div className="mt-5 flex flex-col gap-2.5">
                          <a
                            href={recommendedPath.href}
                            target={isExternalPath ? "_blank" : undefined}
                            rel={isExternalPath ? "noopener noreferrer" : undefined}
                            className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 font-display text-xs font-semibold text-white hover:bg-navy-soft"
                          >
                            <span>Explore {recommendedPath.title}</span>
                            {isExternalPath ? (
                              <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
                            ) : (
                              <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
                            )}
                          </a>

                          <a
                            href="/education#book"
                            className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-white px-5 py-3 font-display text-xs font-semibold text-navy hover:border-navy/45"
                          >
                            <Calendar size={15} strokeWidth={1.75} aria-hidden="true" />
                            <span>Book a 1-on-1 Consultation</span>
                          </a>

                          {recommendedPath.guideHref !== "/education#book" ? (
                            <a
                              href={recommendedPath.guideHref}
                              className="focus-ring inline-flex min-h-10 w-full items-center justify-center gap-1.5 text-xs font-semibold text-navy underline hover:text-gold-darker"
                            >
                              <span>Compare paths in the Investment Guide</span>
                              <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <button
                          type="button"
                          onClick={performRestart}
                          className="focus-ring min-h-11 w-full rounded-full border border-border-strong px-5 py-2.5 font-display text-xs font-semibold text-navy hover:bg-white"
                        >
                          Take the assessment again
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

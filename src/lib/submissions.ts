export interface AssessmentSubmissionPayload {
  name: string;
  email: string;
  answers: Record<string, string>;
  result: {
    bracket: string;
    summary: string;
    recommendation: string;
  };
  submittedAt: string;
}

export interface AssessmentSubmissionResponse {
  ok: boolean;
  reference: string;
  message: string;
}

export async function submitAssessment(
  payload: AssessmentSubmissionPayload,
): Promise<AssessmentSubmissionResponse> {
  const response = await fetch("/api/send-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Unable to submit the assessment right now.");
  }

  return (await response.json()) as AssessmentSubmissionResponse;
}

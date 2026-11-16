import type { QuizResult } from "./assessment.js";

const DEFAULT_API_BASE_URL = "https://open.larksuite.com";
const TOKEN_SAFETY_WINDOW_SECONDS = 60;

interface LarkConfig {
  appId: string;
  appSecret: string;
  baseToken: string;
  tableId: string;
  apiBaseUrl: string;
}

interface LarkBaseResponse {
  code?: number | string;
  msg?: string;
}

interface TenantTokenResponse extends LarkBaseResponse {
  tenant_access_token?: string;
  expire?: number;
}

interface RecordResponse extends LarkBaseResponse {
  data?: {
    record?: {
      record_id?: string;
    };
  };
}

export class LarkApiError extends Error {
  readonly status: number;
  readonly code?: number | string;
  readonly larkMsg?: string;

  constructor(
    message: string,
    details: { status: number; code?: number | string; larkMsg?: string },
  ) {
    super(message);
    this.name = "LarkApiError";
    this.status = details.status;
    this.code = details.code;
    this.larkMsg = details.larkMsg;
  }
}

export interface LeadRecordInput {
  name: string;
  email: string;
  result: QuizResult;
  reference: string;
  submittedAt: string;
  phone?: string;
  plotSize?: string;
  paymentPlan?: string;
  message?: string;
  source?: string;
  trafficSource?: string;
}

let cachedToken: {
  cacheKey: string;
  token: string;
  expiresAt: number;
} | null = null;

// Exported for tests.
export function __resetLarkTokenCache(): void {
  cachedToken = null;
}

function getConfig(): LarkConfig | null {
  const values = {
    appId: process.env.LARK_APP_ID?.trim() || "",
    appSecret: process.env.LARK_APP_SECRET?.trim() || "",
    baseToken: process.env.LARK_BASE_TOKEN?.trim() || "",
    tableId: process.env.LARK_TABLE_ID?.trim() || "",
  };
  const present = Object.values(values).some(Boolean);
  if (!present) return null;

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => `LARK_${name.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);
  if (missing.length > 0) {
    throw new Error(`Incomplete Lark configuration: ${missing.join(", ")}`);
  }

  return {
    ...values,
    apiBaseUrl: process.env.LARK_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
  };
}

function sanitizeErrorText(
  text: string,
  secrets: Array<string | undefined> = [],
): string {
  let clean = text.replace(/[\r\n\t]+/g, " ").trim();
  for (const secret of secrets) {
    if (secret && secret.length > 0) {
      clean = clean.split(secret).join("[REDACTED]");
    }
  }
  clean = clean.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]");
  return clean.slice(0, 300);
}

function parseLarkBody(rawText: string): LarkBaseResponse | null {
  if (!rawText.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(rawText);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as LarkBaseResponse;
    }
  } catch {
    // Non-JSON response body (e.g. upstream HTML/text error); handled by caller.
  }
  return null;
}

/**
 * Safely parse a Lark HTTP response, preserving both `payload.code` and
 * `payload.msg` on HTTP or API-level failures while stripping secrets.
 */
async function readJson<T extends LarkBaseResponse>(
  response: Response,
  secrets: Array<string | undefined> = [],
): Promise<T> {
  const rawText = await response.text().catch(() => "");
  const parsed = parseLarkBody(rawText);
  const code =
    parsed && (typeof parsed.code === "number" || typeof parsed.code === "string")
      ? parsed.code
      : undefined;
  const msg =
    parsed && typeof parsed.msg === "string" && parsed.msg.trim()
      ? sanitizeErrorText(parsed.msg, secrets)
      : "";

  if (!response.ok) {
    const parts: string[] = [];
    if (code !== undefined) parts.push(`code ${String(code)}`);
    if (msg) parts.push(msg);
    const detail =
      parts.length > 0
        ? parts.join(": ")
        : rawText.trim()
          ? sanitizeErrorText(rawText, secrets)
          : "";
    throw new LarkApiError(
      `Lark API request failed (${response.status})${detail ? `: ${detail}` : ""}`,
      { status: response.status, code, larkMsg: msg || undefined },
    );
  }

  if (!parsed) {
    throw new LarkApiError(`Lark API returned invalid JSON (${response.status})`, {
      status: response.status,
    });
  }

  if (parsed.code !== 0) {
    throw new LarkApiError(
      `Lark API returned code ${parsed.code ?? "unknown"}${msg ? `: ${msg}` : ""}`,
      { status: response.status, code: parsed.code, larkMsg: msg || undefined },
    );
  }

  return parsed as T;
}

async function getTenantAccessToken(config: LarkConfig): Promise<string> {
  const cacheKey = `${config.apiBaseUrl}:${config.appId}`;
  if (cachedToken && cachedToken.cacheKey === cacheKey && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(
    `${config.apiBaseUrl}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: config.appId,
        app_secret: config.appSecret,
      }),
    },
  );
  const payload = await readJson<TenantTokenResponse>(response, [config.appSecret]);
  if (!payload.tenant_access_token) {
    throw new Error("Lark API response missing tenant access token");
  }

  const expireSeconds = Number.isFinite(payload.expire) ? Math.max(payload.expire || 0, 120) : 300;
  cachedToken = {
    cacheKey,
    token: payload.tenant_access_token,
    expiresAt: Date.now() + (expireSeconds - TOKEN_SAFETY_WINDOW_SECONDS) * 1000,
  };
  return payload.tenant_access_token;
}

function isAuthError(error: unknown): boolean {
  if (!(error instanceof LarkApiError)) return false;
  if (error.status === 401 || error.status === 403) return true;
  const numericCode = typeof error.code === "number" ? error.code : Number(error.code);
  if (numericCode === 99991661 || numericCode === 99991663 || numericCode === 99991668) {
    return true;
  }
  const msg = `${error.larkMsg || ""} ${error.message}`.toLowerCase();
  return /permission|unauthori[sz]ed|forbidden|access token|app_secret|invalid token/.test(msg);
}

/**
 * Identify Bitable field-name or field-conversion rejections so optional CRM
 * fields or `"Submitted At"` format mismatches can fall back cleanly without
 * masking real auth, permission, or table-level failures.
 */
function isBitableFieldError(error: unknown): boolean {
  if (!(error instanceof LarkApiError)) return false;
  if (isAuthError(error)) return false;

  const numericCode = typeof error.code === "number" ? error.code : Number(error.code);
  if (
    numericCode === 1254045 ||
    (Number.isInteger(numericCode) && numericCode >= 1254060 && numericCode <= 1254069)
  ) {
    return true;
  }

  const msg = `${error.larkMsg || ""} ${error.message}`.toLowerCase();
  return /fieldnamenotfound|fieldconvfail|field conversion|field invalid|invalid field|field not found|unknown field|submitted at/.test(
    msg,
  );
}

function buildCoreFields(
  input: LeadRecordInput,
  summary: string,
  recommendation: string,
  submittedAtValue?: string | number,
): Record<string, string | number> {
  const fields: Record<string, string | number> = {
    Name: input.name,
    Email: input.email,
    Result: input.result.bracket,
    Summary: summary,
    Recommendation: recommendation,
    Reference: input.reference,
    Status: "New",
    Source: input.source || "Financial Clarity Assessment",
  };
  if (submittedAtValue !== undefined) {
    fields["Submitted At"] = submittedAtValue;
  }
  return fields;
}

function foldOptionalFields(
  input: LeadRecordInput,
  extraSubmittedAtIso?: string,
): { summary: string; recommendation: string } {
  const baseSummary = input.result.summary.trim();
  const summaryExtras: string[] = [];

  if (
    input.plotSize &&
    !baseSummary.includes(`Plot Size: ${input.plotSize}`) &&
    !baseSummary.includes(`Strategy: ${input.plotSize}`)
  ) {
    summaryExtras.push(`Plot Size: ${input.plotSize}`);
  }
  if (
    input.paymentPlan &&
    !baseSummary.includes(`Payment Plan: ${input.paymentPlan}`) &&
    !baseSummary.includes(`Plan: ${input.paymentPlan}`)
  ) {
    summaryExtras.push(`Payment Plan: ${input.paymentPlan}`);
  }
  if (input.phone && !baseSummary.includes(input.phone)) {
    summaryExtras.push(`Phone: ${input.phone}`);
  }
  if (input.trafficSource && !baseSummary.includes(`Traffic Source: ${input.trafficSource}`)) {
    summaryExtras.push(`Traffic Source: ${input.trafficSource}`);
  }
  if (extraSubmittedAtIso && !baseSummary.includes(`Submitted At: ${extraSubmittedAtIso}`)) {
    summaryExtras.push(`Submitted At: ${extraSubmittedAtIso}`);
  }

  const summary = [baseSummary, ...summaryExtras].filter(Boolean).join(" · ");

  const baseRecommendation = input.result.recommendation.trim();
  let recommendation = baseRecommendation;
  if (
    input.message &&
    baseRecommendation !== input.message &&
    !baseRecommendation.includes(`Message: ${input.message}`)
  ) {
    recommendation = baseRecommendation
      ? `${baseRecommendation} · Message: ${input.message}`
      : `Message: ${input.message}`;
  }

  return { summary, recommendation };
}

async function postRecord(
  config: LarkConfig,
  tenantAccessToken: string,
  fields: Record<string, string | number>,
): Promise<string> {
  const response = await fetch(
    `${config.apiBaseUrl}/open-apis/bitable/v1/apps/${encodeURIComponent(config.baseToken)}/tables/${encodeURIComponent(config.tableId)}/records`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    },
  );
  const payload = await readJson<RecordResponse>(response, [
    config.appSecret,
    tenantAccessToken,
  ]);
  const recordId = payload.data?.record?.record_id;
  if (!recordId) {
    throw new Error("Lark API response missing record ID");
  }
  return recordId;
}

export async function createLarkLeadRecord(input: LeadRecordInput): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  const parsedTimestamp = Date.parse(input.submittedAt);
  const submittedAtMs = Number.isFinite(parsedTimestamp) ? parsedTimestamp : Date.now();
  const submittedAtIso = new Date(submittedAtMs).toISOString();

  const hasOptionalFields = Boolean(
    input.phone || input.plotSize || input.paymentPlan || input.message || input.trafficSource,
  );

  const initialFields = buildCoreFields(
    input,
    input.result.summary,
    input.result.recommendation,
    submittedAtMs,
  );
  if (input.phone) initialFields.Phone = input.phone;
  if (input.plotSize) initialFields["Plot Size"] = input.plotSize;
  if (input.paymentPlan) initialFields["Payment Plan"] = input.paymentPlan;
  if (input.message) initialFields.Message = input.message;
  if (input.trafficSource) initialFields["Traffic Source"] = input.trafficSource;

  const foldedCore = foldOptionalFields(input);
  const foldedWithoutDate = foldOptionalFields(input, submittedAtIso);

  const attempts: Array<Record<string, string | number>> = [initialFields];
  if (hasOptionalFields) {
    attempts.push(
      buildCoreFields(input, foldedCore.summary, foldedCore.recommendation, submittedAtMs),
    );
  }
  attempts.push(
    buildCoreFields(input, foldedCore.summary, foldedCore.recommendation, submittedAtIso),
  );
  attempts.push(
    buildCoreFields(input, foldedWithoutDate.summary, foldedWithoutDate.recommendation),
  );

  const tenantAccessToken = await getTenantAccessToken(config);
  let lastError: unknown;

  for (let i = 0; i < attempts.length; i += 1) {
    try {
      return await postRecord(config, tenantAccessToken, attempts[i]);
    } catch (error) {
      if (isAuthError(error)) {
        cachedToken = null;
        throw error;
      }
      lastError = error;
      const hasMoreAttempts = i < attempts.length - 1;
      if (!hasMoreAttempts || !isBitableFieldError(error)) {
        throw error;
      }
      console.warn(
        `[lark-base] Retrying lead record ${input.reference} with fallback schema after field rejection:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  throw lastError;
}

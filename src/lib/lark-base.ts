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

interface TenantTokenResponse {
  code?: number;
  tenant_access_token?: string;
  expire?: number;
}

interface RecordResponse {
  code?: number;
  data?: {
    record?: {
      record_id?: string;
    };
  };
}

export interface LeadRecordInput {
  name: string;
  email: string;
  result: QuizResult;
  reference: string;
  submittedAt: string;
}

let cachedToken: {
  cacheKey: string;
  token: string;
  expiresAt: number;
} | null = null;

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

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Lark API request failed (${response.status})`);
  }
  return (await response.json()) as T;
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
  const payload = await readJson<TenantTokenResponse>(response);
  if (payload.code !== 0) {
    throw new Error(`Lark API returned code ${payload.code ?? "unknown"}`);
  }
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

export async function createLarkLeadRecord(input: LeadRecordInput): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  const tenantAccessToken = await getTenantAccessToken(config);
  const response = await fetch(
    `${config.apiBaseUrl}/open-apis/bitable/v1/apps/${encodeURIComponent(config.baseToken)}/tables/${encodeURIComponent(config.tableId)}/records`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Name: input.name,
          Email: input.email,
          Result: input.result.bracket,
          Summary: input.result.summary,
          Recommendation: input.result.recommendation,
          Reference: input.reference,
          "Submitted At": input.submittedAt,
          Status: "New",
          Source: "Financial Clarity Assessment",
        },
      }),
    },
  );
  const payload = await readJson<RecordResponse>(response);
  if (payload.code !== 0) {
    throw new Error(`Lark API returned code ${payload.code ?? "unknown"}`);
  }

  const recordId = payload.data?.record?.record_id;
  if (!recordId) {
    throw new Error("Lark API response missing record ID");
  }
  return recordId;
}

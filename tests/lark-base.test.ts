import assert from "node:assert/strict";
import test from "node:test";
import type { QuizResult } from "../src/lib/assessment.ts";
import {
  __resetLarkTokenCache,
  createLarkLeadRecord,
} from "../src/lib/lark-base.ts";

const LARK_ENV_NAMES = [
  "LARK_APP_ID",
  "LARK_APP_SECRET",
  "LARK_BASE_TOKEN",
  "LARK_TABLE_ID",
  "LARK_API_BASE_URL",
] as const;

const result: QuizResult = {
  bracket: "On the right track",
  summary: "Summary",
  recommendation: "Recommendation",
};

const originalFetch = globalThis.fetch;

function setLarkEnv(values: Partial<Record<(typeof LARK_ENV_NAMES)[number], string>>) {
  for (const name of LARK_ENV_NAMES) {
    delete process.env[name];
  }
  for (const [name, value] of Object.entries(values)) {
    if (value !== undefined) process.env[name] = value;
  }
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

test.afterEach(() => {
  setLarkEnv({});
  restoreFetch();
  __resetLarkTokenCache();
});

test("maps a validated lead to the Assessment Leads fields", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-1",
    LARK_APP_SECRET: "secret-1",
    LARK_BASE_TOKEN: "base-1",
    LARK_TABLE_ID: "table-1",
    LARK_API_BASE_URL: "https://lark.test",
  });

  const requests: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init: init || {} });
    if (requests.length === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-1", expire: 7200 }),
        { status: 200 },
      );
    }
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-123" } } }),
      { status: 200 },
    );
  };

  const recordId = await createLarkLeadRecord({
    name: "Ada Lovelace",
    email: "ada@example.com",
    result,
    reference: "ref-123",
    submittedAt: "2026-10-08T10:00:00.000Z",
  });

  assert.equal(recordId, "rec-123");
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "https://lark.test/open-apis/auth/v3/tenant_access_token/internal");
  assert.deepEqual(JSON.parse(String(requests[0].init.body)), {
    app_id: "app-1",
    app_secret: "secret-1",
  });
  assert.equal(
    requests[1].url,
    "https://lark.test/open-apis/bitable/v1/apps/base-1/tables/table-1/records",
  );
  assert.equal((requests[1].init.headers as Record<string, string>).Authorization, "Bearer tenant-1");
  assert.deepEqual(JSON.parse(String(requests[1].init.body)), {
    fields: {
      Name: "Ada Lovelace",
      Email: "ada@example.com",
      Result: "On the right track",
      Summary: "Summary",
      Recommendation: "Recommendation",
      Reference: "ref-123",
      "Submitted At": Date.parse("2026-10-08T10:00:00.000Z"),
      Status: "New",
      Source: "Financial Clarity Assessment",
    },
  });
});

test("returns null without calling Lark when configuration is absent", async () => {
  setLarkEnv({});
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("unexpected", { status: 500 });
  };

  const recordId = await createLarkLeadRecord({
    name: "Ada Lovelace",
    email: "ada@example.com",
    result,
    reference: "ref-disabled",
    submittedAt: "2026-10-08T10:00:00.000Z",
  });

  assert.equal(recordId, null);
  assert.equal(called, false);
});

test("rejects partial configuration without exposing the secret", async () => {
  setLarkEnv({ LARK_APP_ID: "app-2", LARK_APP_SECRET: "do-not-leak" });

  await assert.rejects(
    createLarkLeadRecord({
      name: "Ada Lovelace",
      email: "ada@example.com",
      result,
      reference: "ref-partial",
      submittedAt: "2026-10-08T10:00:00.000Z",
    }),
    (error: unknown) => {
      assert(error instanceof Error);
      assert.match(error.message, /LARK_BASE_TOKEN/);
      assert.doesNotMatch(error.message, /do-not-leak/);
      return true;
    },
  );
});

test("rejects non-success HTTP responses", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-http",
    LARK_APP_SECRET: "secret-http",
    LARK_BASE_TOKEN: "base-http",
    LARK_TABLE_ID: "table-http",
  });
  globalThis.fetch = async () => new Response("upstream failure", { status: 503 });

  await assert.rejects(
    createLarkLeadRecord({
      name: "Ada Lovelace",
      email: "ada@example.com",
      result,
      reference: "ref-http",
      submittedAt: "2026-10-08T10:00:00.000Z",
    }),
    /Lark API request failed \(503\)/,
  );
});

test("rejects a non-zero Lark response code", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-code",
    LARK_APP_SECRET: "secret-code",
    LARK_BASE_TOKEN: "base-code",
    LARK_TABLE_ID: "table-code",
  });
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: 999, msg: "permission denied" }), { status: 200 });

  await assert.rejects(
    createLarkLeadRecord({
      name: "Ada Lovelace",
      email: "ada@example.com",
      result,
      reference: "ref-code",
      submittedAt: "2026-10-08T10:00:00.000Z",
    }),
    /Lark API returned code 999/,
  );
});

test("maps optional property enquiry CRM fields when provided", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-crm",
    LARK_APP_SECRET: "secret-crm",
    LARK_BASE_TOKEN: "base-crm",
    LARK_TABLE_ID: "table-crm",
    LARK_API_BASE_URL: "https://lark.test",
  });

  const requests: Array<{ url: string; init: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init: init || {} });
    if (requests.length === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-crm", expire: 7200 }),
        { status: 200 },
      );
    }
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-crm-1" } } }),
      { status: 200 },
    );
  };

  const recordId = await createLarkLeadRecord({
    name: "Chinedu Okafor",
    email: "chinedu@example.com",
    phone: "+2348012345678",
    plotSize: "600 SQM",
    paymentPlan: "0-6 Months (Interest-Free)",
    message: "Interested in physical allocation",
    source: "Lekki Avana Signature",
    trafficSource: "https://signature.9jawealth.com/?utm_source=meta",
    result: {
      bracket: "600 SQM",
      summary: "Plot Size: 600 SQM · Plan: 0-6 Months (Interest-Free)",
      recommendation: "Interested in physical allocation",
    },
    reference: "ref-crm-1",
    submittedAt: "2026-10-16T12:00:00.000Z",
  });

  assert.equal(recordId, "rec-crm-1");
  assert.deepEqual(JSON.parse(String(requests[1].init.body)), {
    fields: {
      Name: "Chinedu Okafor",
      Email: "chinedu@example.com",
      Result: "600 SQM",
      Summary: "Plot Size: 600 SQM · Plan: 0-6 Months (Interest-Free)",
      Recommendation: "Interested in physical allocation",
      Reference: "ref-crm-1",
      "Submitted At": Date.parse("2026-10-16T12:00:00.000Z"),
      Status: "New",
      Source: "Lekki Avana Signature",
      Phone: "+2348012345678",
      "Plot Size": "600 SQM",
      "Payment Plan": "0-6 Months (Interest-Free)",
      Message: "Interested in physical allocation",
      "Traffic Source": "https://signature.9jawealth.com/?utm_source=meta",
    },
  });
});

test("error reporting includes payload.code and payload.msg without leaking secrets", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-err-msg",
    LARK_APP_SECRET: "super-secret-value-123",
    LARK_BASE_TOKEN: "base-err",
    LARK_TABLE_ID: "table-err",
    LARK_API_BASE_URL: "https://lark.test",
  });

  let callCount = 0;
  globalThis.fetch = async () => {
    callCount += 1;
    if (callCount === 1) {
      return new Response(
        JSON.stringify({
          code: 0,
          tenant_access_token: "tenant-secret-token-456",
          expire: 7200,
        }),
        { status: 200 },
      );
    }
    return new Response(
      JSON.stringify({
        code: 1254003,
        msg: "TableNotFound for app super-secret-value-123 with Bearer tenant-secret-token-456",
      }),
      { status: 400 },
    );
  };

  await assert.rejects(
    createLarkLeadRecord({
      name: "Ada Lovelace",
      email: "ada@example.com",
      result,
      reference: "ref-err-msg",
      submittedAt: "2026-10-16T12:00:00.000Z",
    }),
    (error: unknown) => {
      assert(error instanceof Error);
      assert.match(error.message, /Lark API request failed \(400\)/);
      assert.match(error.message, /1254003/);
      assert.match(error.message, /TableNotFound/);
      assert.doesNotMatch(error.message, /super-secret-value-123/);
      assert.doesNotMatch(error.message, /tenant-secret-token-456/);
      return true;
    },
  );
  assert.equal(callCount, 2);
});

test("non-zero HTTP 200 Lark code includes payload.msg", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-200-msg",
    LARK_APP_SECRET: "secret-200",
    LARK_BASE_TOKEN: "base-200",
    LARK_TABLE_ID: "table-200",
    LARK_API_BASE_URL: "https://lark.test",
  });

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: 999, msg: "invalid app credentials" }), {
      status: 200,
    });

  await assert.rejects(
    createLarkLeadRecord({
      name: "Ada Lovelace",
      email: "ada@example.com",
      result,
      reference: "ref-200-msg",
      submittedAt: "2026-10-16T12:00:00.000Z",
    }),
    (error: unknown) => {
      assert(error instanceof Error);
      assert.match(error.message, /Lark API returned code 999/);
      assert.match(error.message, /invalid app credentials/);
      assert.doesNotMatch(error.message, /secret-200/);
      return true;
    },
  );
});

test("falls back to core 9-column schema on FieldNameNotFound and preserves property fields", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-fallback",
    LARK_APP_SECRET: "secret-fallback",
    LARK_BASE_TOKEN: "base-fallback",
    LARK_TABLE_ID: "table-fallback",
    LARK_API_BASE_URL: "https://lark.test",
  });

  const bodies: Array<Record<string, unknown>> = [];
  let callCount = 0;
  globalThis.fetch = async (_input, init) => {
    callCount += 1;
    if (callCount === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-fallback", expire: 7200 }),
        { status: 200 },
      );
    }
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    if (callCount === 2) {
      return new Response(
        JSON.stringify({ code: 1254045, msg: "FieldNameNotFound: Phone" }),
        { status: 400 },
      );
    }
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-fallback-1" } } }),
      { status: 200 },
    );
  };

  const recordId = await createLarkLeadRecord({
    name: "Tunde Bakare",
    email: "tunde@example.com",
    phone: "+2348011122233",
    plotSize: "500 SQM",
    paymentPlan: "12 Months",
    message: "Call me after 4pm WAT",
    source: "Lekki Avana Signature",
    trafficSource: "https://signature.9jawealth.com/?utm_source=ig",
    result: {
      bracket: "500 SQM",
      summary: "Signature plot enquiry",
      recommendation: "Follow up on Signature plot",
    },
    reference: "ref-fallback-1",
    submittedAt: "2026-10-16T12:00:00.000Z",
  });

  assert.equal(recordId, "rec-fallback-1");
  assert.equal(callCount, 3);
  assert.equal(bodies.length, 2);

  const retryFields = bodies[1].fields as Record<string, unknown>;
  assert.deepEqual(Object.keys(retryFields).sort(), [
    "Email",
    "Name",
    "Recommendation",
    "Reference",
    "Result",
    "Source",
    "Status",
    "Submitted At",
    "Summary",
  ]);
  assert.match(String(retryFields.Summary), /\+2348011122233/);
  assert.match(String(retryFields.Summary), /500 SQM/);
  assert.match(String(retryFields.Summary), /12 Months/);
  assert.match(String(retryFields.Summary), /utm_source=ig/);
  assert.match(String(retryFields.Recommendation), /Call me after 4pm WAT/);
  assert.equal(retryFields["Submitted At"], Date.parse("2026-10-16T12:00:00.000Z"));
});

test("falls back to core schema + ISO Submitted At on field conversion rejections", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-conv",
    LARK_APP_SECRET: "secret-conv",
    LARK_BASE_TOKEN: "base-conv",
    LARK_TABLE_ID: "table-conv",
    LARK_API_BASE_URL: "https://lark.test",
  });

  const bodies: Array<Record<string, unknown>> = [];
  let callCount = 0;
  globalThis.fetch = async (_input, init) => {
    callCount += 1;
    if (callCount === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-conv", expire: 7200 }),
        { status: 200 },
      );
    }
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    if (callCount === 2) {
      return new Response(
        JSON.stringify({ code: 1254069, msg: "PhoneFieldConvFail" }),
        { status: 400 },
      );
    }
    if (callCount === 3) {
      return new Response(
        JSON.stringify({ code: 1254064, msg: "DateTimeFieldConvFail" }),
        { status: 400 },
      );
    }
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-conv-1" } } }),
      { status: 200 },
    );
  };

  const recordId = await createLarkLeadRecord({
    name: "Ngozi Eze",
    email: "ngozi@example.com",
    phone: "0803-CALL-ME",
    plotSize: "Land Banking",
    message: "Book consultation for next Tuesday",
    source: "Investment Guide Consultation",
    result: {
      bracket: "Land Banking",
      summary: "Consultation request",
      recommendation: "Follow up on Investment Guide Consultation",
    },
    reference: "ref-conv-1",
    submittedAt: "2026-10-16T12:00:00.000Z",
  });

  assert.equal(recordId, "rec-conv-1");
  assert.equal(callCount, 4);
  const finalFields = bodies[2].fields as Record<string, unknown>;
  assert.equal(finalFields["Submitted At"], "2026-10-16T12:00:00.000Z");
  assert.match(String(finalFields.Summary), /0803-CALL-ME/);
  assert.match(String(finalFields.Summary), /Land Banking/);
  assert.match(String(finalFields.Recommendation), /Book consultation for next Tuesday/);
});

test("does not mask or retry real 401/403 authentication or permission errors", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-auth-err",
    LARK_APP_SECRET: "secret-auth-err",
    LARK_BASE_TOKEN: "base-auth-err",
    LARK_TABLE_ID: "table-auth-err",
    LARK_API_BASE_URL: "https://lark.test",
  });

  let callCount = 0;
  globalThis.fetch = async () => {
    callCount += 1;
    if (callCount === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-auth-err", expire: 7200 }),
        { status: 200 },
      );
    }
    return new Response(
      JSON.stringify({ code: 91403, msg: "Forbidden: bitable permission missing" }),
      { status: 403 },
    );
  };

  await assert.rejects(
    createLarkLeadRecord({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+2348012345678",
      result,
      reference: "ref-auth-403",
      submittedAt: "2026-10-16T12:00:00.000Z",
    }),
    (error: unknown) => {
      assert(error instanceof Error);
      assert.match(error.message, /403/);
      assert.match(error.message, /91403/);
      assert.match(error.message, /Forbidden/);
      return true;
    },
  );
  assert.equal(callCount, 2);
});

test("preserves multi-section assessment summary and recommended path metadata", async () => {
  setLarkEnv({
    LARK_APP_ID: "app-rich",
    LARK_APP_SECRET: "secret-rich",
    LARK_BASE_TOKEN: "base-rich",
    LARK_TABLE_ID: "table-rich",
    LARK_API_BASE_URL: "https://lark.test",
  });

  const bodies: Array<Record<string, unknown>> = [];
  let callCount = 0;
  globalThis.fetch = async (_input, init) => {
    callCount += 1;
    if (callCount === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-rich", expire: 7200 }),
        { status: 200 },
      );
    }
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-rich-1" } } }),
      { status: 200 },
    );
  };

  const recordId = await createLarkLeadRecord({
    name: "Kemi Adeyemi",
    email: "kemi@example.com",
    result: {
      bracket: "On the right track",
      summary:
        "There is a meaningful base here | Awareness: 6/9 gaps · Daily discipline: 0/6 gaps · Future planning: 0/11 gaps · Income direction: 5/5 answered (Total gaps: 6/26)",
      recommendation:
        "A clearer system helps | 30-day direction (Q31): Agro-real estate | Primary income (Q27): Business | Matched path: PalmVille Agro Real Estate (https://palmville.9jawealth.com/)",
    },
    reference: "ref-rich-1",
    submittedAt: "2026-10-16T12:00:00.000Z",
  });

  assert.equal(recordId, "rec-rich-1");
  const fields = bodies[0].fields as Record<string, unknown>;
  assert.match(String(fields.Summary), /Awareness: 6\/9 gaps/);
  assert.match(String(fields.Recommendation), /PalmVille Agro Real Estate/);
});



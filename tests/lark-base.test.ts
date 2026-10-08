import assert from "node:assert/strict";
import test from "node:test";
import type { QuizResult } from "../src/lib/assessment.ts";
import { createLarkLeadRecord } from "../src/lib/lark-base.ts";

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
      "Submitted At": "2026-10-08T10:00:00.000Z",
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

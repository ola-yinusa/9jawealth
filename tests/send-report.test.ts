import assert from "node:assert/strict";
import test from "node:test";
import { captureLeadInLark } from "../api/send-report.ts";

const larkEnv = {
  LARK_APP_ID: "app-handler",
  LARK_APP_SECRET: "secret-handler",
  LARK_BASE_TOKEN: "base-handler",
  LARK_TABLE_ID: "table-handler",
};

test("keeps submission success when Lark lead capture fails", async () => {
  const previousEnv = Object.fromEntries(
    Object.keys(larkEnv).map((name) => [name, process.env[name]]),
  );
  const previousFetch = globalThis.fetch;
  const previousError = console.error;
  const errors: unknown[][] = [];
  let requestCount = 0;

  Object.assign(process.env, larkEnv);
  console.error = (...args: unknown[]) => errors.push(args);
  globalThis.fetch = async () => {
    requestCount += 1;
    if (requestCount === 1) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-handler", expire: 7200 }),
        { status: 200 },
      );
    }
    return new Response(JSON.stringify({ code: 403, msg: "permission denied" }), { status: 200 });
  };

  try {
    const captured = await captureLeadInLark({
      name: "Ada Lovelace",
      email: "ada@example.com",
      result: {
        bracket: "On the right track",
        summary: "Summary",
        recommendation: "Recommendation",
      },
      reference: "ref-handler",
      submittedAt: "2026-10-08T10:00:00.000Z",
    });

    assert.equal(captured, false);
    assert.equal(requestCount, 2);
    assert.equal(errors.length, 1);
    assert.match(String(errors[0][0]), /Lark lead capture failed/);
    assert.match(String(errors[0][1]), /ref-handler/);
    assert.doesNotMatch(JSON.stringify(errors), /secret-handler/);
  } finally {
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    globalThis.fetch = previousFetch;
    console.error = previousError;
  }
});

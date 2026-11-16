import assert from "node:assert/strict";
import test from "node:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  __resetRateLimits,
  captureLeadInLark,
  createSendReportHandler,
} from "../api/send-report.ts";
import { __resetLarkTokenCache } from "../src/lib/lark-base.ts";
import type { SendMailInput } from "../src/lib/mailer.ts";

const larkEnv = {
  LARK_APP_ID: "app-handler",
  LARK_APP_SECRET: "secret-handler",
  LARK_BASE_TOKEN: "base-handler",
  LARK_TABLE_ID: "table-handler",
};

function createMockRequest(
  body: unknown,
  ip = "198.51.100.10",
  origin: string | undefined = "https://www.9jawealth.com",
  method = "POST",
): VercelRequest {
  const headers: Record<string, string> = {
    "x-forwarded-for": ip,
  };
  if (origin !== undefined) {
    headers.origin = origin;
  }
  return {
    method,
    headers,
    body,
    socket: { remoteAddress: ip },
  } as unknown as VercelRequest;
}

function createMockResponse() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let jsonBody: unknown = null;

  const res = {
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      jsonBody = payload;
      return res;
    },
    end() {
      return res;
    },
  } as unknown as VercelResponse;

  return {
    res,
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody as Record<string, unknown>;
    },
    headers,
  };
}

function fullAssessmentAnswers(): Record<string, string> {
  const answers: Record<string, string> = {};
  for (let id = 1; id <= 26; id += 1) {
    answers[String(id)] = id <= 6 ? "NO" : "YES";
  }
  answers["27"] = "Business";
  answers["28"] = "Yes";
  answers["29"] = "5–15%";
  answers["30"] = "Thinking about it";
  answers["31"] = "Agro-real estate";
  return answers;
}

const stubMailConfig = () => ({
  host: "smtp.resend.com",
  port: 465,
  secure: true,
  user: "resend",
  password: "re_test_password",
  from: "9jawealth <assessment@9jawealth.com>",
  replyTo: "hello@9jawealth.com",
  notifyTo: "hello@9jawealth.com",
});

test.afterEach(() => {
  __resetRateLimits();
  __resetLarkTokenCache();
});

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

test("assessment submission persists lead in Lark Base and Blob even when Resend fails", async () => {
  const previousEnv = {
    ...Object.fromEntries(Object.keys(larkEnv).map((name) => [name, process.env[name]])),
    BLOB_ENABLED: process.env.BLOB_ENABLED,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  };
  const previousFetch = globalThis.fetch;
  const previousError = console.error;

  Object.assign(process.env, larkEnv);
  process.env.BLOB_ENABLED = "true";
  process.env.BLOB_READ_WRITE_TOKEN = "blob-rw-test";
  console.error = () => {};

  const larkPayloads: Array<Record<string, unknown>> = [];
  const blobWrites: Array<{ path: string; body: string }> = [];
  const mailCalls: SendMailInput[] = [];

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("tenant_access_token")) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-assess", expire: 7200 }),
        { status: 200 },
      );
    }
    larkPayloads.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-assess-1" } } }),
      { status: 200 },
    );
  };

  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    sendMail: async (input) => {
      mailCalls.push(input);
      throw new Error("550 Domain is not verified");
    },
    putBlob: (async (pathname: string, body: unknown) => {
      blobWrites.push({ path: pathname, body: String(body) });
      return {
        url: `https://blob.test/${pathname}`,
        downloadUrl: `https://blob.test/${pathname}`,
        pathname,
        contentType: "application/json; charset=utf-8",
        contentDisposition: "inline",
      };
    }) as unknown as typeof import("@vercel/blob").put,
  });

  try {
    const req = createMockRequest({
      name: "Kemi Adeyemi",
      email: "kemi@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() - 20_000).toISOString(),
      submittedAt: new Date().toISOString(),
    });
    const mockRes = createMockResponse();

    await handler(req, mockRes.res);

    assert.equal(mockRes.statusCode, 200);
    assert.equal(mockRes.jsonBody.ok, true);
    assert.equal(mockRes.jsonBody.larkCaptured, true);
    assert.equal(mockRes.jsonBody.emailSent, false);
    assert.match(String(mockRes.jsonBody.warning), /automated email delivery is currently delayed/i);
    assert.equal(typeof mockRes.jsonBody.reference, "string");

    assert.equal(larkPayloads.length, 1);
    const larkFields = larkPayloads[0].fields as Record<string, unknown>;
    assert.equal(larkFields.Name, "Kemi Adeyemi");
    assert.equal(larkFields.Email, "kemi@example.com");
    assert.equal(larkFields.Result, "On the right track");
    assert.equal(larkFields.Source, "Financial Clarity Assessment");
    assert.equal(larkFields.Reference, mockRes.jsonBody.reference);
    assert.match(String(larkFields.Summary), /Awareness: 6\/9 gaps/);
    assert.match(String(larkFields.Recommendation), /PalmVille Agro Real Estate/);

    assert.equal(blobWrites.length, 1);
    const blobJson = JSON.parse(blobWrites[0].body) as Record<string, unknown>;
    assert.equal(blobJson.name, "Kemi Adeyemi");
    assert.equal(blobJson.emailMasked, "k***@example.com");
    assert.equal(blobJson.reference, mockRes.jsonBody.reference);
    assert.doesNotMatch(blobWrites[0].body, /kemi@example\.com/);

    // Visitor report + both owner notification recipients were attempted.
    assert.equal(mailCalls.length, 3);
  } finally {
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    globalThis.fetch = previousFetch;
    console.error = previousError;
  }
});

test("assessment submission persists lead in Lark Base when only owner notification fails", async () => {
  const previousEnv = Object.fromEntries(
    Object.keys(larkEnv).map((name) => [name, process.env[name]]),
  );
  const previousFetch = globalThis.fetch;
  const previousError = console.error;

  Object.assign(process.env, larkEnv);
  console.error = () => {};

  let larkCapturedCount = 0;
  globalThis.fetch = async (input) => {
    if (String(input).includes("tenant_access_token")) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-owner-fail", expire: 7200 }),
        { status: 200 },
      );
    }
    larkCapturedCount += 1;
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-assess-2" } } }),
      { status: 200 },
    );
  };

  let emailCall = 0;
  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    sendMail: async () => {
      emailCall += 1;
      if (emailCall === 1) return "msg-visitor-ok";
      throw new Error("SMTP timeout on owner notification");
    },
  });

  try {
    const req = createMockRequest({
      name: "Bola Tinubu-Test",
      email: "bola@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() - 15_000).toISOString(),
    });
    const mockRes = createMockResponse();

    await handler(req, mockRes.res);

    assert.equal(mockRes.statusCode, 200);
    assert.equal(mockRes.jsonBody.ok, true);
    assert.equal(mockRes.jsonBody.larkCaptured, true);
    assert.equal(mockRes.jsonBody.emailSent, false);
    assert.match(String(mockRes.jsonBody.warning), /automated email delivery is currently delayed/i);
    assert.equal(larkCapturedCount, 1);
  } finally {
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    globalThis.fetch = previousFetch;
    console.error = previousError;
  }
});

test("consultation-booking payload captures to Lark Base and sends Resend confirmation + owner lead email", async () => {
  const previousEnv = Object.fromEntries(
    Object.keys(larkEnv).map((name) => [name, process.env[name]]),
  );
  const previousFetch = globalThis.fetch;

  Object.assign(process.env, larkEnv);

  const larkRequests: Array<Record<string, unknown>> = [];
  const mailCalls: SendMailInput[] = [];

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("tenant_access_token")) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-consult", expire: 7200 }),
        { status: 200 },
      );
    }
    larkRequests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-consult-1" } } }),
      { status: 200 },
    );
  };

  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    sendMail: async (input) => {
      mailCalls.push(input);
      return `msg-${mailCalls.length}`;
    },
  });

  try {
    const req = createMockRequest({
      type: "consultation-booking",
      source: "Investment Guide Consultation",
      name: "Seyi Balogun",
      email: "seyi@example.com",
      phone: "+2348099988877",
      strategy: "Land Banking",
      message: "Looking to invest N15M in Ibeju Lekki",
      trafficSource: "https://www.9jawealth.com/education.html",
    });
    const mockRes = createMockResponse();

    await handler(req, mockRes.res);

    assert.equal(mockRes.statusCode, 200);
    assert.equal(mockRes.jsonBody.ok, true);
    assert.equal(mockRes.jsonBody.success, true);
    assert.equal(mockRes.jsonBody.larkCaptured, true);
    assert.equal(mockRes.jsonBody.emailSent, true);
    assert.match(String(mockRes.jsonBody.message), /Consultation booking captured/);

    assert.equal(larkRequests.length, 1);
    const larkFields = larkRequests[0].fields as Record<string, unknown>;
    assert.equal(larkFields.Name, "Seyi Balogun");
    assert.equal(larkFields.Email, "seyi@example.com");
    assert.equal(larkFields.Source, "Investment Guide Consultation");
    assert.equal(larkFields.Result, "Land Banking");
    assert.equal(larkFields.Phone, "+2348099988877");
    assert.equal(larkFields["Plot Size"], "Land Banking");
    assert.equal(larkFields.Message, "Looking to invest N15M in Ibeju Lekki");
    assert.match(String(larkFields.Summary), /Strategy: Land Banking/);
    assert.match(String(larkFields.Summary), /Phone: \+2348099988877/);

    // 1 visitor email + 2 owner notifications (notifyTo + fallback owner)
    assert.equal(mailCalls.length, 3);
    assert.equal(mailCalls[0].to, "seyi@example.com");
    assert.match(mailCalls[0].subject, /Investment Guide Consultation/);
    assert.match(mailCalls[0].html, /https:\/\/wa\.link\/fz5g34/);
    assert.equal(mailCalls[1].replyTo, "seyi@example.com");
    assert.match(mailCalls[1].text, /Strategy: Land Banking/);
    assert.match(mailCalls[1].text, /Phone: \+2348099988877/);
    assert.match(mailCalls[1].text, /Looking to invest N15M in Ibeju Lekki/);
  } finally {
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    globalThis.fetch = previousFetch;
  }
});

test("consultation via property-enquiry + Investment Guide Consultation survives Lark missing optional columns and Resend failure", async () => {
  const previousEnv = Object.fromEntries(
    Object.keys(larkEnv).map((name) => [name, process.env[name]]),
  );
  const previousFetch = globalThis.fetch;
  const previousError = console.error;
  const previousWarn = console.warn;

  Object.assign(process.env, larkEnv);
  console.error = () => {};
  console.warn = () => {};

  const larkRequests: Array<Record<string, unknown>> = [];
  let postCount = 0;

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("tenant_access_token")) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-consult-fb", expire: 7200 }),
        { status: 200 },
      );
    }
    postCount += 1;
    larkRequests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    if (postCount === 1) {
      return new Response(
        JSON.stringify({ code: 1254045, msg: "FieldNameNotFound: Plot Size" }),
        { status: 400 },
      );
    }
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-consult-fb-1" } } }),
      { status: 200 },
    );
  };

  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    sendMail: async () => {
      throw new Error("Resend outage");
    },
  });

  try {
    const req = createMockRequest({
      type: "property-enquiry",
      source: "Investment Guide Consultation",
      "Full Name": "Amaka Obi",
      "Email Address": "amaka@example.com",
      phone: "+2348022233344",
      "Plot Size": "Oil Palm Plantation",
      message: "Prefer weekend call",
    });
    const mockRes = createMockResponse();

    await handler(req, mockRes.res);

    assert.equal(mockRes.statusCode, 200);
    assert.equal(mockRes.jsonBody.ok, true);
    assert.equal(mockRes.jsonBody.larkCaptured, true);
    assert.equal(mockRes.jsonBody.emailSent, false);
    assert.match(String(mockRes.jsonBody.message), /captured in CRM/i);

    assert.equal(larkRequests.length, 2);
    const fallbackFields = larkRequests[1].fields as Record<string, unknown>;
    assert.equal(fallbackFields.Source, "Investment Guide Consultation");
    assert.match(String(fallbackFields.Summary), /Oil Palm Plantation/);
    assert.match(String(fallbackFields.Summary), /\+2348022233344/);
    assert.match(String(fallbackFields.Recommendation), /Prefer weekend call/);
  } finally {
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    globalThis.fetch = previousFetch;
    console.error = previousError;
    console.warn = previousWarn;
  }
});

test("consultation-booking validates name/email and rejects total capture failure with 500", async () => {
  const previousError = console.error;
  console.error = () => {};

  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    createLarkLeadRecord: async () => {
      throw new Error("Lark unavailable");
    },
    sendMail: async () => {
      throw new Error("SMTP unavailable");
    },
  });

  try {
    const invalidReq = createMockRequest({
      type: "consultation-booking",
      name: "A",
      email: "bad-email",
    });
    const invalidRes = createMockResponse();
    await handler(invalidReq, invalidRes.res);
    assert.equal(invalidRes.statusCode, 400);

    const failReq = createMockRequest({
      type: "consultation-booking",
      name: "Valid Name",
      email: "valid@example.com",
    });
    const failRes = createMockResponse();
    await handler(failReq, failRes.res);
    assert.equal(failRes.statusCode, 500);
    assert.match(String(failRes.jsonBody.error), /Unable to capture/);
  } finally {
    console.error = previousError;
  }
});

test("assessment submission returns 500 when both Lark Base and Resend fail", async () => {
  const previousError = console.error;
  console.error = () => {};

  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    createLarkLeadRecord: async () => {
      throw new Error("Lark unavailable");
    },
    sendMail: async () => {
      throw new Error("SMTP unavailable");
    },
  });

  try {
    const req = createMockRequest({
      name: "Kemi Adeyemi",
      email: "kemi@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() - 20_000).toISOString(),
      submittedAt: new Date().toISOString(),
    });
    const mockRes = createMockResponse();

    await handler(req, mockRes.res);

    assert.equal(mockRes.statusCode, 500);
    assert.equal(mockRes.jsonBody.error, "Unable to send the assessment email");
    assert.equal(typeof mockRes.jsonBody.reference, "string");
  } finally {
    console.error = previousError;
  }
});

test("assessment email and owner notification include 4-section breakdown, Q31 direction, and matched path", async () => {
  const previousEnv = Object.fromEntries(
    Object.keys(larkEnv).map((name) => [name, process.env[name]]),
  );
  const previousFetch = globalThis.fetch;

  Object.assign(process.env, larkEnv);

  globalThis.fetch = async (input) => {
    if (String(input).includes("tenant_access_token")) {
      return new Response(
        JSON.stringify({ code: 0, tenant_access_token: "tenant-rich-email", expire: 7200 }),
        { status: 200 },
      );
    }
    return new Response(
      JSON.stringify({ code: 0, data: { record: { record_id: "rec-rich-email-1" } } }),
      { status: 200 },
    );
  };

  const mailCalls: SendMailInput[] = [];
  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    sendMail: async (input) => {
      mailCalls.push(input);
      return `msg-${mailCalls.length}`;
    },
  });

  try {
    const req = createMockRequest({
      name: "Ngozi Nwosu",
      email: "ngozi@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() - 30_000).toISOString(),
      submittedAt: new Date().toISOString(),
    });
    const mockRes = createMockResponse();

    await handler(req, mockRes.res);

    assert.equal(mockRes.statusCode, 200);
    assert.equal(mockRes.jsonBody.ok, true);
    assert.equal(mockRes.jsonBody.larkCaptured, true);
    assert.equal(mockRes.jsonBody.emailSent, true);
    assert.equal(mailCalls.length, 3);

    const visitorEmail = mailCalls[0];
    assert.equal(visitorEmail.to, "ngozi@example.com");
    assert.match(visitorEmail.html, /Section A: Awareness/);
    assert.match(visitorEmail.html, /Section B: Daily discipline/);
    assert.match(visitorEmail.html, /Section C: Future planning/);
    assert.match(visitorEmail.html, /Section D: Income direction/);
    assert.match(visitorEmail.html, /Agro-real estate/);
    assert.match(visitorEmail.html, /PalmVille Agro Real Estate/);
    assert.match(visitorEmail.html, /https:\/\/palmville\.9jawealth\.com\//);

    const ownerEmail = mailCalls[1];
    assert.match(ownerEmail.text, /Awareness: 6\/9 gaps/);
    assert.match(ownerEmail.text, /30-day direction \(Q31\): Agro-real estate/);
    assert.match(ownerEmail.text, /PalmVille Agro Real Estate/);
  } finally {
    for (const [name, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    globalThis.fetch = previousFetch;
  }
});

test("dwell time check tolerates clock skew up to 5 minutes ahead while blocking sub-2s scripted POSTs", async () => {
  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    createLarkLeadRecord: async () => null,
    sendMail: async () => "msg-ok",
  });

  // Legitimate user whose browser clock is 2 minutes ahead of server time (with submittedAt).
  const skewedWithSubmittedReq = createMockRequest(
    {
      name: "Clock Skew User",
      email: "skew1@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() + 75_000).toISOString(),
      submittedAt: new Date(Date.now() + 120_000).toISOString(),
    },
    "198.51.100.21",
  );
  const skewedWithSubmittedRes = createMockResponse();
  await handler(skewedWithSubmittedReq, skewedWithSubmittedRes.res);
  assert.equal(skewedWithSubmittedRes.statusCode, 200);

  // Legitimate user whose browser clock is 2 minutes ahead (without submittedAt).
  const skewedWithoutSubmittedReq = createMockRequest(
    {
      name: "Clock Skew User 2",
      email: "skew2@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() + 120_000).toISOString(),
    },
    "198.51.100.22",
  );
  const skewedWithoutSubmittedRes = createMockResponse();
  await handler(skewedWithoutSubmittedReq, skewedWithoutSubmittedRes.res);
  assert.equal(skewedWithoutSubmittedRes.statusCode, 200);

  // Scripted sub-2-second submission (with submittedAt).
  const botWithSubmittedReq = createMockRequest(
    {
      name: "Fast Bot",
      email: "bot1@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() - 500).toISOString(),
      submittedAt: new Date().toISOString(),
    },
    "198.51.100.23",
  );
  const botWithSubmittedRes = createMockResponse();
  await handler(botWithSubmittedReq, botWithSubmittedRes.res);
  assert.equal(botWithSubmittedRes.statusCode, 429);

  // Scripted sub-2-second submission (without submittedAt).
  const botWithoutSubmittedReq = createMockRequest(
    {
      name: "Fast Bot 2",
      email: "bot2@example.com",
      answers: fullAssessmentAnswers(),
      startedAt: new Date(Date.now() - 500).toISOString(),
    },
    "198.51.100.24",
  );
  const botWithoutSubmittedRes = createMockResponse();
  await handler(botWithoutSubmittedReq, botWithoutSubmittedRes.res);
  assert.equal(botWithoutSubmittedRes.statusCode, 429);
});

test("CORS allows production domains and 9jawealth-*.vercel.app previews while rejecting lookalikes", async () => {
  const handler = createSendReportHandler({
    getMailConfig: stubMailConfig,
    createLarkLeadRecord: async () => null,
    sendMail: async () => "msg-ok",
  });

  for (const allowedOrigin of [
    "https://www.9jawealth.com",
    "https://9jawealth.vercel.app",
    "https://9jawealth-git-fix-lead-capture.vercel.app",
  ]) {
    const req = createMockRequest({}, "198.51.100.30", allowedOrigin, "OPTIONS");
    const mockRes = createMockResponse();
    await handler(req, mockRes.res);
    assert.equal(mockRes.statusCode, 204);
    assert.equal(mockRes.headers["access-control-allow-origin"], allowedOrigin);
    assert.notEqual(mockRes.headers["access-control-allow-origin"], "*");
  }

  for (const blockedOrigin of [
    "https://evil-9jawealth.vercel.app",
    "https://9jawealth.vercel.app.evil.com",
    "https://evil.com",
  ]) {
    const req = createMockRequest({}, "198.51.100.31", blockedOrigin, "OPTIONS");
    const mockRes = createMockResponse();
    await handler(req, mockRes.res);
    assert.equal(mockRes.statusCode, 403);
  }
});

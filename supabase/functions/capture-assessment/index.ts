import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const bucketName = "assessment-submissions";

type SubmissionPayload = {
  name: string;
  email: string;
  answers: Record<string, string>;
  result: {
    bracket: string;
    summary: string;
    recommendation: string;
  };
  submittedAt: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const submission = (await request.json()) as SubmissionPayload;

    if (!submission.name || !submission.email || !submission.answers || !submission.result) {
      return new Response(JSON.stringify({ error: "Missing required submission fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Supabase environment is not configured" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: "2MB",
      });

      if (createBucketError && !createBucketError.message.toLowerCase().includes("already exists")) {
        throw createBucketError;
      }
    }

    const submittedAt = submission.submittedAt || new Date().toISOString();
    const datePrefix = submittedAt.slice(0, 10);
    const identifier = crypto.randomUUID();
    const objectPath = `${datePrefix}/${slugify(submission.name) || "assessment"}-${identifier}.json`;

    const payload = {
      ...submission,
      submittedAt,
      storagePath: objectPath,
      capturedBy: "capture-assessment-edge-function",
    };

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(objectPath, JSON.stringify(payload, null, 2), {
        contentType: "application/json; charset=utf-8",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reference: identifier,
        message: "Assessment captured successfully",
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

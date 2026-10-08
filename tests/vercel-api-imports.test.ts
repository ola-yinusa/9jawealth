import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Vercel API relative imports use ESM file extensions", () => {
  const files = ["../api/send-report.ts", "../src/lib/lark-base.ts", "../src/lib/lead-notification.ts"];
  const imports = files.flatMap((file) => {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    return [...source.matchAll(/from\s+["'](\.\.?\/[^"']+)["']/g)].map(
      ([, specifier]) => specifier,
    );
  });

  assert.ok(imports.length > 0);
  assert.deepEqual(
    imports.filter((specifier) => !specifier.endsWith(".js")),
    [],
  );
});

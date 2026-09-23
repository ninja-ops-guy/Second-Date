const base = process.env.SECOND_DATE_URL;
if (!base) {
  console.error("SECOND_DATE_URL is required, e.g. https://second-date.example");
  process.exit(2);
}

const root = base.replace(/\/$/, "");
const checks = [
  ["/", 200],
  ["/app", 200],
  ["/privacy", 200],
  ["/terms", 200],
  ["/api/health", 200],
  ["/api/readiness", 200],
];

let failed = false;
for (const [path, expected] of checks) {
  try {
    const response = await fetch(root + path, { redirect: "follow" });
    const ok = response.status === expected;
    console.log(`${ok ? "PASS" : "FAIL"} ${path} -> ${response.status}`);
    if (!ok) {
      failed = true;
      if (path === "/api/readiness") {
        try {
          console.log(await response.text());
        } catch {
          // Best-effort diagnostic output.
        }
      }
    }
  } catch (error) {
    failed = true;
    console.log(`FAIL ${path} -> ${error instanceof Error ? error.message : String(error)}`);
  }
}

process.exit(failed ? 1 : 0);

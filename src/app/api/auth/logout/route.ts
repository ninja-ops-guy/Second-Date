import { destroySession } from "@/lib/auth";
import { rejectUntrustedBrowserMutation } from "@/lib/request-security";

export async function POST(request: Request) {
  const rejected = rejectUntrustedBrowserMutation(request);
  if (rejected) return rejected;
  await destroySession();
  return Response.json({ ok: true });
}

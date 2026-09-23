export function isTrustedBrowserMutation(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function rejectUntrustedBrowserMutation(request: Request) {
  return isTrustedBrowserMutation(request)
    ? null
    : Response.json({ error: "Cross-origin request rejected." }, { status: 403 });
}

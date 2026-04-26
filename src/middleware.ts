import { NextResponse, type NextRequest } from "next/server";
import { siteFromHost } from "@/lib/site";

export const config = {
  // Only rewrite the root — every other path (including /u/...) passes through.
  matcher: "/",
};

/**
 * Hostname-based routing for the multi-tenant setup:
 *   keyandboard.com           → /        (KeyandboardView, the union page)
 *   baranorhan.dev            → /u/baran
 *   kayrauckilinc.dev         → /u/kayra
 *
 * Rewriting (rather than reading the Host header inside the page) means each
 * host hits a distinct URL, so Vercel's edge cache stores them separately and
 * can't accidentally serve one host's response to another host.
 *
 * The `?_site=baran|kayra|keyandboard` query param is honored locally for
 * previewing variants without DNS.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Query-string override for local previews
  const override = url.searchParams.get("_site");
  if (override === "baran" || override === "kayra") {
    url.pathname = `/u/${override}`;
    url.searchParams.delete("_site");
    return NextResponse.rewrite(url);
  }
  if (override === "keyandboard") {
    url.searchParams.delete("_site");
    return NextResponse.next();
  }

  // Host-based routing
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const site = siteFromHost(host);

  if (site.variant === "founder" && site.founderId) {
    url.pathname = `/u/${site.founderId}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

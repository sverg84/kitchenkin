import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const tab = url.searchParams.get("tab");

  const validTabs = new Set(["recipes", "favorites"]);

  if (!tab || !validTabs.has(tab)) {
    const newUrl = url.clone();
    newUrl.searchParams.set("tab", "recipes");

    return NextResponse.redirect(newUrl, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/profile",
};

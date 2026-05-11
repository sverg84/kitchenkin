import { auth } from "@/auth";
import { NextResponse } from "next/server";

const validTabs = new Set(["recipes", "favorites"]);

function isProtectedPath(pathname: string) {
  return (
    pathname === "/profile" ||
    pathname === "/recipe/new" ||
    /^\/recipe\/[^/]+\/edit$/.test(pathname)
  );
}

const authProxy = auth((req) => {
  const { pathname } = req.nextUrl;

  if (isProtectedPath(pathname) && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/profile") {
    const tab = req.nextUrl.searchParams.get("tab");

    if (!tab || !validTabs.has(tab)) {
      const newUrl = req.nextUrl.clone();
      newUrl.searchParams.set("tab", "recipes");
      return NextResponse.redirect(newUrl, 307);
    }
  }

  return NextResponse.next();
});

export { authProxy as proxy };

export const config = {
  matcher: ["/profile", "/recipe/new", "/recipe/:id/edit"],
};

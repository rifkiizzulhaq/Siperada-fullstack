import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user.role;

  const isAuthPage = ["/auth", "/login"].some((path) =>
    req.nextUrl.pathname.startsWith(path),
  );

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLoggedIn && !isAuthPage) {
    const { pathname } = req.nextUrl;

    // Root Redirects
    const ROOT_REDIRECTS: Record<string, string> = {
      superadmin: "/users",
      admin: "/admin-dashboard",
      unit: "/unit-dashboard",
    };

    if (pathname === "/" && role && ROOT_REDIRECTS[role]) {
      return NextResponse.redirect(new URL(ROOT_REDIRECTS[role], req.url));
    }

    // Role Based Route Protection
    const ROLE_PROTECTED_ROUTES = [
      { path: "/users", role: "superadmin" },
      { path: "/admin-dashboard", role: "admin" },
      { path: "/unit-dashboard", role: "unit" },
    ];

    for (const routeConfig of ROLE_PROTECTED_ROUTES) {
      if (pathname.startsWith(routeConfig.path) && role !== routeConfig.role) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Permission Checks
    const ROUTE_PERMISSIONS = [
      { path: "/kategori", permission: "admin:read-kategori" },
      { path: "/komponen-program", permission: "admin:read-komponen-program" },
      { path: "/satuan", permission: "admin:read-satuan" },
      { path: "/akun-detail", permission: "admin:read-akun-detail" },
      { path: "/usulan-kegiatan", permission: "unit:read-usulan-kegiatan" },
      { path: "/judul-kegiatan", permission: "unit:read-judul-kegiatan" },
    ];

    const hasPermission = (permission: string) => 
      req.auth?.user.permissions?.some((p) => p.name === permission);

    for (const route of ROUTE_PERMISSIONS) {
      if (pathname.startsWith(route.path) && !hasPermission(route.permission)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

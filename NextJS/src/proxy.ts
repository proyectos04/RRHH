import NextAuth from "next-auth";
import authConfig from "../auth.config";
import { NextResponse } from "next/server";

const { auth: proxy } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/register"];
export default proxy((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  if (!publicRoutes.includes(nextUrl.pathname) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (publicRoutes.includes(nextUrl.pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  return NextResponse.next();
});
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

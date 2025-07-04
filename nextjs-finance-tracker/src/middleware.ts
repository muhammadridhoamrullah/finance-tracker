import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  try {
    // console.log("Masuk middleware");

    const cookiesAuth = (await cookies()).get("access_token");
    // console.log(cookiesAuth, "ini cookiesAuth middleware");

    if (!cookiesAuth) {
      return NextResponse.redirect(new URL("/login", request.url), {
        status: 307,
      });
    }

    let token = cookiesAuth.value;

    // console.log(token, "ini token middleware");

    const secret = new TextEncoder().encode(process.env.SECRET!);

    // console.log(secret, "ini secret middleware");

    const decoded = await jose.jwtVerify<{
      _id: string;
      username: string;
      role: "User" | "Admin";
    }>(token, secret);

    // console.log(decoded, "ini decoded middleware");

    const reqHeaders = new Headers(request.headers);

    // console.log(reqHeaders, "ini reqHeaders middleware");

    reqHeaders.set("x-user-id", decoded.payload._id);
    reqHeaders.set("x-username", decoded.payload.username);
    reqHeaders.set("x-role", decoded.payload.role);

    return NextResponse.next({
      request: {
        headers: reqHeaders,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "Internal Server Error",
        },
        {
          status: 500,
        }
      );
    }
  }
}

export const config = {
  matcher: [
    "/api/budgets/:path*",
    "/api/transactions/:path*",
    "/home/:path*",
    "/budget/:path*",
    "/transaction/:path*",
  ],
};

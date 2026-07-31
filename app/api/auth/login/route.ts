import { NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/instagram";

export async function GET() {
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = getInstagramAuthUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}

import { NextResponse } from "next/server";
import { getInstagramAuthUrl } from "@/lib/instagram";

export async function GET() {
  if (!process.env.INSTAGRAM_CLIENT_ID || !process.env.INSTAGRAM_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Instagram OAuth is not configured. Set INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET." },
      { status: 500 }
    );
  }

  if (!process.env.INSTAGRAM_REDIRECT_URI) {
    return NextResponse.json(
      { error: "Instagram redirect URI is not configured." },
      { status: 500 }
    );
  }

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

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "redblog_verify_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[webhook] Verification successful");
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  console.error("[webhook] Verification failed", { mode, token });
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[webhook] Received Instagram webhook:", JSON.stringify(body));

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[webhook] Error processing webhook:", err);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}

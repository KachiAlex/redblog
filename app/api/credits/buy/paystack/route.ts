import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CREDIT_BUNDLES, getBundleTotalCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const { creatorId, bundleId } = await req.json();

    if (!creatorId || !bundleId) {
      return NextResponse.json(
        { error: "creatorId and bundleId required" },
        { status: 400 }
      );
    }

    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) {
      return NextResponse.json({ error: "Invalid bundle" }, { status: 400 });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      select: { id: true, igUsername: true },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const totalCredits = getBundleTotalCredits(bundle);
    const origin = process.env.APP_BASE_URL || "http://localhost:3000";
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackKey) {
      return NextResponse.json(
        { error: "Paystack not configured" },
        { status: 500 }
      );
    }

    const reference = `rblog_${creatorId}_${Date.now()}`;

    const res = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: `creator-${creatorId}@redblog.app`,
          amount: Math.round(bundle.price * 100 * 100),
          currency: "USD",
          reference,
          callback_url: `${origin}/api/credits/webhook/paystack`,
          metadata: {
            creatorId,
            bundleId,
            credits: String(totalCredits),
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Paystack init error:", err);
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      );
    }

    const data = await res.json();

    await prisma.creditPurchase.create({
      data: {
        creatorId,
        credits: totalCredits,
        amountPaid: bundle.price,
        provider: "paystack",
        status: "pending",
        reference,
      },
    });

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

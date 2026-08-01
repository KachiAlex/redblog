import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackKey) {
      return NextResponse.json({ error: "Paystack not configured" }, { status: 500 });
    }

    const reference = body?.data?.reference;
    if (!reference) {
      return NextResponse.json({ error: "No reference" }, { status: 400 });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      }
    );

    if (!verifyRes.ok) {
      console.error("Paystack verification failed");
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const verifyData = await verifyRes.json();

    if (verifyData.data.status !== "success") {
      return NextResponse.json({ received: true });
    }

    const creatorId = verifyData.data.metadata?.creatorId;
    const credits = parseInt(verifyData.data.metadata?.credits || "0", 10);
    const amountPaid = verifyData.data.amount / 100 / 100;

    if (creatorId && credits > 0) {
      const existing = await prisma.creditPurchase.findFirst({
        where: { reference, status: "pending" },
      });

      if (existing) {
        await addCredits(creatorId, credits, amountPaid, "paystack", reference);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

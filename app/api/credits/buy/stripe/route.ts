import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { CREDIT_BUNDLES, getBundleTotalCredits } from "@/lib/credits";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, {
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
  });
}

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

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${bundle.label} — ${totalCredits} RedBlog Credits`,
              description: `Credits for AI Studio access`,
            },
            unit_amount: Math.round(bundle.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        creatorId,
        bundleId,
        credits: String(totalCredits),
      },
      success_url: `${origin}/dashboard/campaigns?credits=success`,
      cancel_url: `${origin}/dashboard/campaigns?credits=cancelled`,
    });

    await prisma.creditPurchase.create({
      data: {
        creatorId,
        credits: totalCredits,
        amountPaid: bundle.price,
        provider: "stripe",
        status: "pending",
        reference: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

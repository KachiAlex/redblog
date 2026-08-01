import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { addCredits } from "@/lib/credits";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, {
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const creatorId = session.metadata?.creatorId;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (creatorId && credits > 0) {
      const existing = await prisma.creditPurchase.findFirst({
        where: { reference: session.id, status: "pending" },
      });

      if (existing) {
        await addCredits(
          creatorId,
          credits,
          session.amount_total ? session.amount_total / 100 : 0,
          "stripe",
          session.id
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}

import { prisma } from "@/lib/db";
import {
  getTextProviderCredits,
  getImageProviderCredits,
} from "@/lib/ai-providers";

export const REGENERATE_CREDITS = 2;

export interface CreditBundle {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  label: string;
  popular?: boolean;
  bestValue?: boolean;
}

export const CREDIT_BUNDLES: CreditBundle[] = [
  {
    id: "starter",
    credits: 20,
    bonus: 0,
    price: 5,
    label: "Starter",
  },
  {
    id: "popular",
    credits: 50,
    bonus: 5,
    price: 10,
    label: "Popular",
    popular: true,
  },
  {
    id: "best-value",
    credits: 100,
    bonus: 20,
    price: 18,
    label: "Best Value",
    bestValue: true,
  },
];

export function getBundleTotalCredits(bundle: CreditBundle): number {
  return bundle.credits + bundle.bonus;
}

/**
 * Calculates the total credit cost for a campaign generation.
 */
export function calculateGenerationCost(
  textProviderId: string,
  imageProviderId: string
): number {
  return (
    getTextProviderCredits(textProviderId) +
    getImageProviderCredits(imageProviderId)
  );
}

/**
 * Checks if a creator has enough credits for an action.
 */
export async function hasEnoughCredits(
  creatorId: string,
  amount: number
): Promise<boolean> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: { credits: true },
  });
  return (creator?.credits ?? 0) >= amount;
}

/**
 * Deducts credits from a creator and records the transaction.
 * Returns false if the creator doesn't have enough credits.
 */
export async function deductCredits(
  creatorId: string,
  amount: number,
  action: string,
  provider?: string,
  description?: string
): Promise<boolean> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: { credits: true },
  });

  if (!creator || creator.credits < amount) {
    return false;
  }

  await prisma.$transaction([
    prisma.creator.update({
      where: { id: creatorId },
      data: { credits: { decrement: amount } },
    }),
    prisma.creditTransaction.create({
      data: {
        creatorId,
        amount: -amount,
        action,
        provider,
        description,
      },
    }),
  ]);

  return true;
}

/**
 * Adds purchased credits to a creator and records the transaction + purchase.
 */
export async function addCredits(
  creatorId: string,
  credits: number,
  amountPaid: number,
  provider: "stripe" | "paystack",
  reference: string
): Promise<void> {
  await prisma.$transaction([
    prisma.creator.update({
      where: { id: creatorId },
      data: { credits: { increment: credits } },
    }),
    prisma.creditTransaction.create({
      data: {
        creatorId,
        amount: credits,
        action: "purchase",
        description: `Purchased ${credits} credits via ${provider}`,
      },
    }),
    prisma.creditPurchase.create({
      data: {
        creatorId,
        credits,
        amountPaid,
        provider,
        status: "completed",
        reference,
      },
    }),
  ]);
}

/**
 * Gets a creator's current credit balance and whether free trial credits are still valid.
 */
export async function getCreditBalance(
  creatorId: string
): Promise<{ credits: number; freeTrialExpired: boolean }> {
  const creator = await prisma.creator.findUnique({
    where: { id: creatorId },
    select: { credits: true, freeCreditsExpiry: true },
  });

  if (!creator) {
    return { credits: 0, freeTrialExpired: false };
  }

  const freeTrialExpired =
    creator.freeCreditsExpiry !== null &&
    creator.freeCreditsExpiry < new Date();

  return {
    credits: creator.credits,
    freeTrialExpired,
  };
}

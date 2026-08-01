import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCreditBalance } from "@/lib/credits";

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json({ error: "creatorId required" }, { status: 400 });
  }

  const balance = await getCreditBalance(creatorId);
  return NextResponse.json(balance);
}

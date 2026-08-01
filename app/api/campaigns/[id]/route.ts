import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { posts: { orderBy: { scheduledFor: "asc" } } },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body as { status?: string };

    if (!status || !["scheduled", "canceled"].includes(status)) {
      return NextResponse.json({ error: "status must be 'scheduled' or 'canceled'" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.campaign.update({
      where: { id: params.id },
      data: { status },
    });

    // Approving a campaign schedules all of its remaining draft posts.
    // Canceling it removes any posts that haven't published yet.
    if (status === "scheduled") {
      await prisma.scheduledPost.updateMany({
        where: { campaignId: params.id, status: "draft" },
        data: { status: "scheduled" },
      });
    } else {
      await prisma.scheduledPost.deleteMany({
        where: { campaignId: params.id, status: { in: ["draft", "scheduled"] } },
      });
    }

    const updated = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: { posts: { orderBy: { scheduledFor: "asc" } } },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err) {
    console.error("Update campaign error:", err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.campaign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete campaign error:", err);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}

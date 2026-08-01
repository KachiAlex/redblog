import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildSchedule, generateCampaignPlan, generateImage, Cadence } from "@/lib/ai";
import { saveGeneratedImage } from "@/lib/images";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    const campaigns = await prisma.campaign.findMany({
      where: creatorId ? { creatorId } : undefined,
      include: { posts: { orderBy: { scheduledFor: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("List campaigns error:", err);
    return NextResponse.json({ error: "Failed to load campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, context, cadence, tone, startDate, endDate } = body as {
      creatorId?: string;
      context?: string;
      cadence?: Cadence;
      tone?: string;
      startDate?: string;
      endDate?: string;
    };

    if (!creatorId || !context?.trim() || !cadence || !startDate || !endDate) {
      return NextResponse.json(
        { error: "creatorId, context, cadence, startDate and endDate are required" },
        { status: 400 }
      );
    }

    if (!["daily", "weekly", "monthly"].includes(cadence)) {
      return NextResponse.json({ error: "Invalid cadence" }, { status: 400 });
    }

    const creator = await prisma.creator.findUnique({ where: { id: creatorId } });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const schedule = buildSchedule(start, end, cadence);
    if (schedule.length === 0) {
      return NextResponse.json({ error: "Date range produces no posts for this cadence" }, { status: 400 });
    }
    if (schedule.length > 31) {
      return NextResponse.json({ error: "Too many posts requested (max 31 per campaign)" }, { status: 400 });
    }

    const plan = await generateCampaignPlan({
      context,
      tone,
      cadence,
      schedule,
      igUsername: creator.igUsername,
    });

    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        context,
        cadence,
        tone: tone || null,
        startDate: start,
        endDate: end,
        status: "draft",
      },
    });

    const posts = [];
    for (const item of plan) {
      let imageFilePath: string | null = null;
      try {
        const imageBuffer = await generateImage(item.imagePrompt);
        const saved = saveGeneratedImage(imageBuffer, `${campaign.id}-${posts.length}`);
        imageFilePath = saved.filePath;
      } catch (imgErr) {
        console.error("Image generation failed for a campaign post:", imgErr);
      }

      const post = await prisma.scheduledPost.create({
        data: {
          creatorId,
          campaignId: campaign.id,
          caption: item.caption,
          imagePrompt: item.imagePrompt,
          imageFilePath,
          scheduledFor: new Date(item.scheduledFor),
          status: "draft",
        },
      });
      posts.push(post);
    }

    return NextResponse.json({ success: true, campaign: { ...campaign, posts } });
  } catch (err) {
    console.error("Create campaign error:", err);
    const message = err instanceof Error ? err.message : "Campaign generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

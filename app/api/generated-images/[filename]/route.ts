import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Serves locally-generated images from /public/generated.
 *
 * In production (Vercel), generated images are uploaded to Vercel Blob and
 * the stored ScheduledPost.imageFilePath is an absolute Blob URL, so this
 * route is never hit. It exists for local development where images are
 * written to the filesystem by saveGeneratedImage().
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const fileName = params.filename;

  if (!fileName || !/^[a-zA-Z0-9_-]+\.png$/.test(fileName)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "generated", fileName);

  try {
    if (fs.existsSync(filePath)) {
      const imageBuffer = fs.readFileSync(filePath);
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          "Content-Length": imageBuffer.length.toString(),
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch {
    // fall through to 404
  }

  return NextResponse.json({ error: "Image not found" }, { status: 404 });
}

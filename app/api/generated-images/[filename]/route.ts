import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const fileName = params.filename;

  if (!fileName || !/^[a-zA-Z0-9_-]+\.png$/.test(fileName)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const possiblePaths = [
    path.join("/tmp", "generated", fileName),
    path.join(process.cwd(), "public", "generated", fileName),
  ];

  for (const filePath of possiblePaths) {
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
      continue;
    }
  }

  return NextResponse.json({ error: "Image not found" }, { status: 404 });
}

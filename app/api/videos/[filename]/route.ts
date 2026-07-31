import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const fileName = params.filename;

  if (!fileName || !/^[a-zA-Z0-9_-]+\.mp4$/.test(fileName)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const possiblePaths = [
    path.join("/tmp", "videos", fileName),
    path.join(process.cwd(), "public", "videos", fileName),
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const videoBuffer = fs.readFileSync(filePath);

        const range = req.headers.get("range");
        if (range) {
          const match = range.match(/bytes=(\d+)-(\d*)/);
          if (match) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
            const chunk = videoBuffer.subarray(start, end + 1);
            return new NextResponse(chunk, {
              status: 206,
              headers: {
                "Content-Range": `bytes ${start}-${end}/${stat.size}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunk.length.toString(),
                "Content-Type": "video/mp4",
              },
            });
          }
        }

        return new NextResponse(videoBuffer, {
          status: 200,
          headers: {
            "Content-Length": stat.size.toString(),
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Video not found" }, { status: 404 });
}

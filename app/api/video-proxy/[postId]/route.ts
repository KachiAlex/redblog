import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    select: { videoFilePath: true, videoUrl: true, igPostId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Prefer hosted video (Blob URL is publicly accessible)
  if (post.videoFilePath) {
    return NextResponse.redirect(post.videoFilePath, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Fallback: proxy the Instagram CDN URL to bypass CORS
  if (post.videoUrl) {
    try {
      const videoRes = await fetch(post.videoUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "*/*",
          Referer: "https://www.instagram.com/",
        },
        redirect: "follow",
      });

      if (!videoRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch video" },
          { status: 502 }
        );
      }

      const contentType = videoRes.headers.get("content-type") || "video/mp4";
      const contentLength = videoRes.headers.get("content-length");

      const headers: Record<string, string> = {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      };

      if (contentLength) {
        headers["Content-Length"] = contentLength;
      }

      // Support range requests for video seeking
      const range = req.headers.get("range");
      if (range) {
        const videoResWithRange = await fetch(post.videoUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "*/*",
            Referer: "https://www.instagram.com/",
            Range: range,
          },
          redirect: "follow",
        });

        if (videoResWithRange.ok || videoResWithRange.status === 206) {
          const rangeContent = videoResWithRange.headers.get("content-range");
          const rangeLength = videoResWithRange.headers.get("content-length");

          return new NextResponse(videoResWithRange.body, {
            status: videoResWithRange.status,
            headers: {
              "Content-Type": contentType,
              "Content-Range": rangeContent || "",
              "Content-Length": rangeLength || "",
              "Cache-Control": "public, max-age=3600",
              "Access-Control-Allow-Origin": "*",
              "Accept-Ranges": "bytes",
            },
          });
        }
      }

      return new NextResponse(videoRes.body, {
        status: 200,
        headers,
      });
    } catch (err) {
      console.error("[video-proxy] Error:", err);
      return NextResponse.json(
        { error: "Failed to proxy video" },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "No video available" }, { status: 404 });
}

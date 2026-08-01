import { put } from "@vercel/blob";

export async function uploadVideoToBlob(
  videoUrl: string,
  postId: string
): Promise<string | null> {
  const fileName = `videos/${postId}.mp4`;

  const res = await fetch(videoUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download video (status ${res.status})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const blob = await put(fileName, buffer, {
    access: "public",
    contentType: "video/mp4",
    addRandomSuffix: false,
  });

  return blob.url;
}

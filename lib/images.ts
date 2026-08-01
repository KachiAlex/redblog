import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Saves an AI-generated image buffer and returns a publicly reachable URL/path.
 *
 * - On Vercel: uploads to Vercel Blob and returns the permanent Blob URL.
 *   This is required because /tmp is ephemeral and not shared across
 *   invocations, so images stored there would be gone by the time the
 *   cron publish route needs Instagram to fetch them.
 *
 * - Locally: writes to /public/generated and returns the served path
 *   (/generated/<file>.png), which the dev server serves directly.
 */
export async function saveGeneratedImage(
  buffer: Buffer,
  id: string
): Promise<{ filePath: string; fileName: string }> {
  const fileName = `${id}.png`;

  if (isVercel) {
    const { url } = await put(`generated/${fileName}`, buffer, {
      access: "public",
      contentType: "image/png",
      addRandomSuffix: false,
    });
    return { filePath: url, fileName };
  }

  const imagesDir = path.join(process.cwd(), "public", "generated");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  const filePath = path.join(imagesDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return { filePath: `/generated/${fileName}`, fileName };
}

/**
 * Resolves a stored image path/URL back to an absolute URL that Instagram
 * can fetch. Blob URLs are already absolute; local served paths get the
 * origin prepended.
 */
export function toAbsoluteUrl(servedPath: string, origin: string): string {
  if (/^https?:\/\//.test(servedPath)) return servedPath;
  return `${origin}${servedPath}`;
}

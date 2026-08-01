import fs from "fs";
import path from "path";

const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Saves an AI-generated image buffer to disk and returns a path that can be
 * requested back from the app (served via /api/generated-images/[filename]
 * when running serverless, or directly from /public/generated when local).
 */
export function saveGeneratedImage(
  buffer: Buffer,
  id: string
): { filePath: string; fileName: string } {
  const fileName = `${id}.png`;

  const imagesDir = isVercel
    ? path.join("/tmp", "generated")
    : path.join(process.cwd(), "public", "generated");

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const filePath = path.join(imagesDir, fileName);
  fs.writeFileSync(filePath, buffer);

  const servedPath = isVercel ? `/api/generated-images/${fileName}` : `/generated/${fileName}`;
  return { filePath: servedPath, fileName };
}

/** Resolves a served image path (as stored on ScheduledPost) back to an absolute URL. */
export function toAbsoluteUrl(servedPath: string, origin: string): string {
  if (/^https?:\/\//.test(servedPath)) return servedPath;
  return `${origin}${servedPath}`;
}

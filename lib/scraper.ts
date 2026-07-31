import fs from "fs";
import path from "path";
import { chromium } from "playwright-core";
import sparticuzChromium from "@sparticuz/chromium";

export interface ScrapedPost {
  igPostId: string;
  permalink: string;
  caption: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  mediaType: string;
  publishedAt: string;
}

export interface ScrapedProfile {
  igUserId: string;
  igUsername: string;
  igProfilePic: string | null;
  fullName: string | null;
  bio: string | null;
  posts: ScrapedPost[];
}

const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

const LOCAL_CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];

function findLocalChrome(): string | undefined {
  return LOCAL_CHROME_PATHS.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
}

async function launchBrowser() {
  if (isVercel) {
    const executablePath = await sparticuzChromium.executablePath();
    return chromium.launch({
      headless: true,
      executablePath,
      args: sparticuzChromium.args,
    });
  }

  const chromePath = findLocalChrome();
  return chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });
}

function extractShortcodeFromUrl(url: string): string | null {
  const match = url.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/);
  return match ? match[2] : null;
}

export async function scrapeProfile(
  username: string
): Promise<ScrapedProfile> {
  const cleanUsername = username.replace(/^@/, "").trim();

  const browser = await launchBrowser();

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  const page = await context.newPage();

  try {
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
    await page.goto(profileUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const notFound = await page
      .locator("text=Sorry, this page isn't available")
      .count();
    if (notFound > 0) {
      throw new Error(`Instagram handle @${cleanUsername} not found`);
    }

    const profileData = await page.evaluate(() => {
      const getMeta = (property: string) =>
        document
          .querySelector(`meta[property="${property}"]`)
          ?.getAttribute("content") || null;

      const html = document.documentElement.outerHTML;

      const idMatch = html.match(/"id":"(\d+)"/);
      const profilePicMatch = html.match(/"profile_pic_url":"(https:[^"]+)"/);
      const fullNameMatch = html.match(/"full_name":"([^"]+)"/);
      const bioMatch = html.match(/"biography":"([^"]+)"/);

      const postLinks = Array.from(
        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')
      )
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((url) => /\/(p|reel|reels)\/[A-Za-z0-9_-]+/.test(url));

      const uniqueLinks = [...new Set(postLinks)].slice(0, 12);

      return {
        igUserId: idMatch?.[1] || null,
        igProfilePic: profilePicMatch?.[1]?.replace(/\\u0026/g, "&") || null,
        fullName: fullNameMatch?.[1] || null,
        bio: bioMatch?.[1]?.replace(/\\n/g, "\n") || null,
        postUrls: uniqueLinks,
      };
    });

    if (!profileData.igUserId) {
      profileData.igUserId = `scanned_${cleanUsername}`;
    }

    if (!profileData.igProfilePic) {
      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      if (ogImage) profileData.igProfilePic = ogImage;
    }

    if (!profileData.fullName) {
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute("content");
      if (ogTitle) {
        profileData.fullName = ogTitle.replace(/\s*\(@.*\)$/, "");
      }
    }

    if (!profileData.bio) {
      const ogDesc = await page
        .locator('meta[property="og:description"]')
        .getAttribute("content");
      if (ogDesc) {
        profileData.bio = ogDesc;
      }
    }

    const posts: ScrapedPost[] = [];

    for (const postUrl of profileData.postUrls) {
      try {
        const postPage = await context.newPage();
        await postPage.goto(postUrl, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        await postPage.waitForTimeout(1500);

        const postData = await postPage.evaluate(() => {
          const getMeta = (prop: string) =>
            document
              .querySelector(`meta[property="${prop}"]`)
              ?.getAttribute("content") || null;

          const html = document.documentElement.outerHTML;

          let videoUrl: string | null = null;
          const videoPatterns = [
            /"video_url":"(https:[^"]+)"/,
            /"video_versions":\[\{"url":"(https:[^"]+)"/,
            /property="og:video"(?:[^>]*?)content="(https:[^"]+)"/,
            /property="og:video:url"(?:[^>]*?)content="(https:[^"]+)"/,
          ];
          for (const pattern of videoPatterns) {
            const match = html.match(pattern);
            if (match) {
              videoUrl = match[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
              break;
            }
          }

          if (!videoUrl) {
            const videoEl = document.querySelector("video");
            if (videoEl) {
              const source = videoEl.querySelector("source");
              videoUrl =
                (source?.getAttribute("src") as string) ||
                (videoEl.getAttribute("src") as string) ||
                null;
            }
          }

          const thumbnailUrl = getMeta("og:image");
          const caption = getMeta("og:description");

          const isVideo =
            videoUrl !== null ||
            getMeta("og:video") !== null ||
            html.includes('"video_url"') ||
            html.includes("og:video");

          return { videoUrl, thumbnailUrl, caption, isVideo };
        });

        await postPage.close();

        const shortcode = extractShortcodeFromUrl(postUrl);
        if (!shortcode) continue;

        posts.push({
          igPostId: shortcode,
          permalink: postUrl,
          caption: postData.caption,
          thumbnailUrl: postData.thumbnailUrl,
          videoUrl: postData.videoUrl,
          mediaType: postData.isVideo ? "VIDEO" : "IMAGE",
          publishedAt: new Date().toISOString(),
        });
      } catch {
        continue;
      }
    }

    return {
      igUserId: profileData.igUserId,
      igUsername: cleanUsername,
      igProfilePic: profileData.igProfilePic,
      fullName: profileData.fullName,
      bio: profileData.bio,
      posts,
    };
  } finally {
    await browser.close();
  }
}

export async function downloadVideo(
  videoUrl: string,
  postId: string
): Promise<{ filePath: string; fileName: string } | null> {
  const fileName = `${postId}.mp4`;

  let videosDir: string;
  let publicPath: string;

  if (isVercel) {
    videosDir = path.join("/tmp", "videos");
    publicPath = `/tmp/videos/${fileName}`;
  } else {
    videosDir = path.join(process.cwd(), "public", "videos");
    publicPath = `/videos/${fileName}`;
  }

  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const filePath = path.join(videosDir, fileName);

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

  fs.writeFileSync(filePath, buffer);

  return {
    filePath: publicPath,
    fileName,
  };
}

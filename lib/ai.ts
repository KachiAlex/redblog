import { resolveTextConfig, resolveImageConfig } from "@/lib/ai-providers";

/**
 * Thrown for any AI-provider failure. `message` is safe to show directly to
 * end users; the full technical detail (provider response body, stack, etc.)
 * is logged server-side via `detail` so we can debug without exposing
 * internals (API keys, provider error formats) to the UI.
 */
export class AiError extends Error {
  detail?: string;
  constructor(message: string, detail?: string) {
    super(message);
    this.name = "AiError";
    this.detail = detail;
  }
}

export type Cadence = "daily" | "weekly" | "monthly";

export interface PlannedPost {
  scheduledFor: string; // ISO date
  caption: string;
  imagePrompt: string;
}

async function chatCompletion(
  textProvider: string | undefined,
  messages: { role: string; content: string }[],
  temperature: number
): Promise<string> {
  const { provider, baseUrl, model, apiKey } = resolveTextConfig(textProvider);
  if (!apiKey) {
    console.error(`[ai] Missing ${provider.apiKeyEnv} for text provider "${provider.id}"`);
    throw new AiError(`${provider.label} isn't available right now. Please try a different caption model.`);
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages,
        temperature,
      }),
    });
  } catch (err) {
    console.error(`[ai] Network error calling ${provider.label}:`, err);
    throw new AiError(`Couldn't reach ${provider.label}. Please try again in a moment.`);
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[ai] ${provider.label} chat completion failed (${res.status}):`, detail);
    throw new AiError(`${provider.label} couldn't generate a caption right now. Please try again or pick a different model.`, detail);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.error(`[ai] ${provider.label} returned an empty completion:`, JSON.stringify(data));
    throw new AiError(`${provider.label} returned an empty response. Please try again.`);
  }
  return content;
}

/** Computes the list of dates a campaign should post on, based on cadence. */
export function buildSchedule(
  startDate: Date,
  endDate: Date,
  cadence: Cadence,
  postHour = 12
): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(postHour, 0, 0, 0);

  const stepDays = cadence === "daily" ? 1 : cadence === "weekly" ? 7 : 30;

  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + stepDays);
  }

  return dates;
}

/**
 * Asks the LLM to draft a caption + image prompt for every scheduled slot,
 * grounded in the creator-provided context.
 */
export async function generateCampaignPlan(params: {
  context: string;
  tone?: string;
  cadence: Cadence;
  schedule: Date[];
  igUsername: string;
  textProvider?: string;
}): Promise<PlannedPost[]> {
  const { context, tone, cadence, schedule, igUsername, textProvider } = params;

  const system = `You are a social media strategist and copywriter for Instagram creators.
Given a creator's context and a list of dates, produce one Instagram post per date.
Each post needs:
- "caption": an engaging, on-brand Instagram caption (with relevant hashtags, tasteful emoji use is optional)
- "imagePrompt": a detailed prompt for an AI image generator to create the accompanying image/artwork for that post

Vary the angle/topic across posts so the ${cadence} series feels like a cohesive but non-repetitive content calendar.
Respond ONLY with a JSON object: {"posts": [{"date": "<ISO date from input>", "caption": "...", "imagePrompt": "..."}, ...]}
The "posts" array must have exactly ${schedule.length} entries, one per given date, in the same order.`;

  const user = `Instagram account: @${igUsername}
Tone/style: ${tone || "authentic, on-brand for the creator"}
Posting cadence: ${cadence}
Creator's context / campaign brief:
"""
${context}
"""

Dates to generate posts for:
${schedule.map((d) => d.toISOString()).join("\n")}`;

  const content = await chatCompletion(
    textProvider,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    0.9
  );

  let parsed: { posts?: { date: string; caption: string; imagePrompt: string }[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("[ai] Malformed JSON campaign plan:", content);
    throw new AiError("The AI returned an unexpected response while planning your campaign. Please try again.");
  }

  const posts = parsed.posts || [];
  return schedule.map((date, i) => {
    const match = posts[i];
    return {
      scheduledFor: date.toISOString(),
      caption: match?.caption?.trim() || `New post for ${igUsername}.`,
      imagePrompt: match?.imagePrompt?.trim() || context,
    };
  });
}

/** Regenerates a single caption + image prompt, optionally with extra instructions. */
export async function regenerateCaption(params: {
  context: string;
  tone?: string;
  igUsername: string;
  instructions?: string;
  textProvider?: string;
}): Promise<{ caption: string; imagePrompt: string }> {
  const { context, tone, igUsername, instructions, textProvider } = params;

  const system = `You are a social media strategist and copywriter for Instagram creators.
Produce a single Instagram post grounded in the creator's context.
Respond ONLY with a JSON object: {"caption": "...", "imagePrompt": "..."}`;

  const user = `Instagram account: @${igUsername}
Tone/style: ${tone || "authentic, on-brand for the creator"}
Creator's context / campaign brief:
"""
${context}
"""
${instructions ? `Extra instructions for this specific post: ${instructions}` : ""}`;

  const content = await chatCompletion(
    textProvider,
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    1
  );

  let parsed: { caption?: string; imagePrompt?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("[ai] Malformed JSON caption regeneration:", content);
    throw new AiError("The AI returned an unexpected response. Please try again.");
  }

  return {
    caption: parsed.caption?.trim() || "",
    imagePrompt: parsed.imagePrompt?.trim() || context,
  };
}

/**
 * Generates an image from a prompt and returns the raw PNG/JPEG bytes.
 * Returns null if the "none" image provider is selected (caption-only posts).
 */
export async function generateImage(
  prompt: string,
  imageProvider?: string
): Promise<Buffer | null> {
  if (imageProvider === "none") return null;

  const { provider, baseUrl, model, apiKey } = resolveImageConfig(imageProvider);
  if (provider.id === "none") return null;
  if (!apiKey) {
    console.error(`[ai] Missing ${provider.apiKeyEnv} for image provider "${provider.id}"`);
    throw new AiError(`${provider.label} isn't available right now. Please try a different image option, or choose "No image".`);
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: provider.responseFormat,
      }),
    });
  } catch (err) {
    console.error(`[ai] Network error calling ${provider.label}:`, err);
    throw new AiError(`Couldn't reach ${provider.label}. Please try again in a moment.`);
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error(`[ai] ${provider.label} image generation failed (${res.status}):`, detail);
    throw new AiError(`${provider.label} couldn't generate an image right now. Please try again or pick a different option.`, detail);
  }

  const data = await res.json();
  const item = data.data?.[0];
  if (!item) {
    console.error(`[ai] ${provider.label} returned no image data:`, JSON.stringify(data));
    throw new AiError(`${provider.label} didn't return an image. Please try again.`);
  }

  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }

  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) {
      console.error(`[ai] Failed to download generated image from ${provider.label}: ${imgRes.status}`);
      throw new AiError(`Couldn't download the image generated by ${provider.label}. Please try again.`);
    }
    return Buffer.from(await imgRes.arrayBuffer());
  }

  console.error(`[ai] ${provider.label} returned an unrecognized image response:`, JSON.stringify(data));
  throw new AiError(`${provider.label} returned an unexpected response. Please try again.`);
}

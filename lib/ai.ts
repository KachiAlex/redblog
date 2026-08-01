import { resolveTextConfig, resolveImageConfig } from "@/lib/ai-providers";

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
    throw new Error(`${provider.apiKeyEnv} is not configured for the ${provider.label} text provider`);
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider.label} chat completion failed: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.label} returned an empty completion`);
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
    throw new Error("The model returned malformed JSON for the campaign plan");
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

  const parsed = JSON.parse(content);
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
    throw new Error(`${provider.apiKeyEnv} is not configured for the ${provider.label} image provider`);
  }

  const res = await fetch(`${baseUrl}/images/generations`, {
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider.label} image generation failed: ${err}`);
  }

  const data = await res.json();
  const item = data.data?.[0];
  if (!item) throw new Error(`${provider.label} returned no image data`);

  if (item.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }

  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Failed to download generated image from ${provider.label}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }

  throw new Error(`${provider.label} returned an unrecognized image response`);
}

const OPENAI_BASE = "https://api.openai.com/v1";
const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");
  return key;
}

export type Cadence = "daily" | "weekly" | "monthly";

export interface PlannedPost {
  scheduledFor: string; // ISO date
  caption: string;
  imagePrompt: string;
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
}): Promise<PlannedPost[]> {
  const { context, tone, cadence, schedule, igUsername } = params;

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

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI chat completion failed: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty completion");

  let parsed: { posts?: { date: string; caption: string; imagePrompt: string }[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned malformed JSON for the campaign plan");
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
}): Promise<{ caption: string; imagePrompt: string }> {
  const { context, tone, igUsername, instructions } = params;

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

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI chat completion failed: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty completion");

  const parsed = JSON.parse(content);
  return {
    caption: parsed.caption?.trim() || "",
    imagePrompt: parsed.imagePrompt?.trim() || context,
  };
}

/** Generates an image from a prompt and returns the raw PNG/JPEG bytes. */
export async function generateImage(prompt: string): Promise<Buffer> {
  const res = await fetch(`${OPENAI_BASE}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      size: "1024x1024",
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI image generation failed: ${err}`);
  }

  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");

  return Buffer.from(b64, "base64");
}

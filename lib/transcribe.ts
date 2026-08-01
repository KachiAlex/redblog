/**
 * Auto-transcription service: turns video posts into SEO articles.
 *
 * Flow:
 * 1. Download the video from its URL (Blob or Instagram CDN)
 * 2. Send audio to OpenAI Whisper API for transcription
 * 3. Use GPT-4o-mini to format the transcript into a readable blog article
 * 4. Auto-generate content tags from the article
 */

const OPENAI_BASE = "https://api.openai.com/v1";

export interface TranscriptionResult {
  articleBody: string;
  tags: string[];
}

/**
 * Downloads a video and returns it as a Buffer suitable for multipart upload.
 */
async function downloadVideoBuffer(videoUrl: string): Promise<Buffer> {
  const res = await fetch(videoUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://www.instagram.com/",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download video (status ${res.status})`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Sends a video buffer to OpenAI's Whisper API for transcription.
 */
async function transcribeVideo(videoBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(videoBuffer)], { type: "video/mp4" });
  formData.append("file", blob, fileName);
  formData.append("model", "whisper-1");
  formData.append("language", "en");

  const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper transcription failed: ${err}`);
  }

  const data = await res.json();
  return data.text || "";
}

/**
 * Uses GPT to turn a raw transcript into a polished blog article with
 * proper headings, paragraphs, and SEO keywords. Also returns auto-tags.
 */
async function generateArticle(transcript: string, caption?: string): Promise<TranscriptionResult> {
  const prompt = `You are a skilled blog writer. Turn the following Instagram video transcript into a polished, SEO-friendly blog article.

Rules:
- Write in the creator's voice (first person)
- Add a compelling title as an H2 heading
- Break the content into 2-4 sections with H3 subheadings
- Keep it concise (150-400 words) — expand on the transcript, don't pad
- Use natural, conversational language
- Include relevant keywords for SEO
- Do NOT mention "Instagram", "Reel", or "video" — write as if this was always a blog post
- If the transcript is too short or unclear, use the caption as additional context

${caption ? `Instagram caption: ${caption}` : ""}

Transcript:
"""
${transcript}
"""

Return your response as JSON with this exact shape:
{"title": "...", "body": "...", "tags": ["tag1", "tag2", ...]}

The "body" should be the full article HTML (starting with the <h2> title, then <p> and <h3> tags).
The "tags" should be 3-6 lowercase single-word or two-word content tags.`;

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Article generation failed: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from GPT");
  }

  const parsed = JSON.parse(content);
  return {
    articleBody: parsed.body || "",
    tags: parsed.tags || [],
  };
}

/**
 * Full pipeline: download video → transcribe → generate article.
 * Returns null if the video URL is missing or transcription fails.
 */
export async function transcribePost(
  videoUrl: string,
  postId: string,
  caption?: string | null
): Promise<TranscriptionResult | null> {
  if (!videoUrl) return null;

  try {
    const videoBuffer = await downloadVideoBuffer(videoUrl);
    const transcript = await transcribeVideo(videoBuffer, `${postId}.mp4`);

    if (!transcript || transcript.trim().length < 10) {
      return null;
    }

    const result = await generateArticle(transcript, caption || undefined);
    return result;
  } catch (err) {
    console.error(`[transcribe] Failed for post ${postId}:`, err);
    return null;
  }
}

export const INSTAGRAM_AUTH_URL = "https://www.instagram.com/oauth/authorize";
export const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
export const INSTAGRAM_GRAPH_BASE = "https://graph.instagram.com/v23.0";
export const INSTAGRAM_TOKEN_BASE = "https://graph.instagram.com";
export const INSTAGRAM_OEMBED_URL = "https://graph.facebook.com/v23.0/instagram_oembed";

export function getInstagramAuthUrl(state: string): string {
  const params = new URLSearchParams({
    force_reauth: "true",
    client_id: process.env.INSTAGRAM_CLIENT_ID || "",
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || "",
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights",
    state,
  });
  return `${INSTAGRAM_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch(INSTAGRAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID || "",
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || "",
      code,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return res.json();
}

export async function getLongLivedToken(shortLivedToken: string) {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    access_token: shortLivedToken,
  });
  const res = await fetch(
    `${INSTAGRAM_TOKEN_BASE}/access_token?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to get long-lived token");
  return res.json();
}

export async function refreshLongLivedToken(token: string) {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: token,
  });
  const res = await fetch(
    `${INSTAGRAM_TOKEN_BASE}/refresh_access_token?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to refresh token");
  return res.json();
}

export async function getInstagramProfile(token: string) {
  const res = await fetch(
    `${INSTAGRAM_GRAPH_BASE}/me?fields=id,username,account_type,media_count&access_token=${token}`
  );
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function getMedia(token: string, limit = 25) {
  const res = await fetch(
    `${INSTAGRAM_GRAPH_BASE}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${token}`
  );
  if (!res.ok) throw new Error("Failed to fetch media");
  return res.json();
}

/**
 * Creates an Instagram media container for a single image post.
 * `imageUrl` must be a publicly reachable URL — Instagram fetches it directly.
 */
export async function createMediaContainer(
  igUserId: string,
  token: string,
  imageUrl: string,
  caption: string
) {
  const params = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: token,
  });
  const res = await fetch(`${INSTAGRAM_GRAPH_BASE}/${igUserId}/media`, {
    method: "POST",
    body: params,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create media container: ${err}`);
  }
  return res.json();
}

/** Checks whether a media container has finished processing and is ready to publish. */
export async function getContainerStatus(containerId: string, token: string) {
  const res = await fetch(
    `${INSTAGRAM_GRAPH_BASE}/${containerId}?fields=status_code&access_token=${token}`
  );
  if (!res.ok) throw new Error("Failed to fetch container status");
  return res.json();
}

/** Publishes a previously-created media container to the creator's feed. */
export async function publishMediaContainer(
  igUserId: string,
  token: string,
  creationId: string
) {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: token,
  });
  const res = await fetch(`${INSTAGRAM_GRAPH_BASE}/${igUserId}/media_publish`, {
    method: "POST",
    body: params,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to publish media container: ${err}`);
  }
  return res.json();
}

export async function getOEmbed(permalink: string, accessToken?: string) {
  const params = new URLSearchParams({
    url: permalink,
  });
  if (accessToken) {
    params.set("access_token", accessToken);
  } else if (process.env.META_APP_ACCESS_TOKEN) {
    params.set("access_token", process.env.META_APP_ACCESS_TOKEN);
  }

  const res = await fetch(`${INSTAGRAM_OEMBED_URL}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`oEmbed fetch failed: ${err}`);
  }
  return res.json();
}

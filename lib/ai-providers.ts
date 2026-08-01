/**
 * Registry of supported AI providers for campaign generation.
 * Text providers all speak the OpenAI-compatible chat completions API,
 * so swapping providers is just a base URL + API key + model change.
 */

export interface TextProviderConfig {
  id: string;
  label: string;
  credits: number;
  baseUrl: string;
  defaultModel: string;
  apiKeyEnv: string;
  modelEnv: string;
  baseUrlEnv: string;
}

export interface ImageProviderConfig {
  id: string;
  label: string;
  credits: number;
  baseUrl: string;
  defaultModel: string;
  apiKeyEnv: string;
  modelEnv: string;
  baseUrlEnv: string;
  /** Some providers only ever return an image URL, never b64_json. */
  responseFormat: "b64_json" | "url";
}

export const TEXT_PROVIDERS: Record<string, TextProviderConfig> = {
  openai: {
    id: "openai",
    label: "Premium AI",
    credits: 2,
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    apiKeyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_CHAT_MODEL",
    baseUrlEnv: "OPENAI_BASE_URL",
  },
  deepseek: {
    id: "deepseek",
    label: "Budget AI",
    credits: 1,
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    modelEnv: "DEEPSEEK_MODEL",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
  },
  kimi: {
    id: "kimi",
    label: "Standard AI",
    credits: 2,
    baseUrl: "https://api.moonshot.ai/v1",
    defaultModel: "kimi-latest",
    apiKeyEnv: "MOONSHOT_API_KEY",
    modelEnv: "MOONSHOT_MODEL",
    baseUrlEnv: "MOONSHOT_BASE_URL",
  },
};

export const DEFAULT_TEXT_PROVIDER = "deepseek";

export const IMAGE_PROVIDERS: Record<string, ImageProviderConfig> = {
  "openai-dalle3": {
    id: "openai-dalle3",
    label: "Premium Image",
    credits: 4,
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "dall-e-3",
    apiKeyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_IMAGE_MODEL",
    baseUrlEnv: "OPENAI_BASE_URL",
    responseFormat: "b64_json",
  },
  "openai-dalle2": {
    id: "openai-dalle2",
    label: "Standard Image",
    credits: 3,
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "dall-e-2",
    apiKeyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_IMAGE_MODEL_CHEAP",
    baseUrlEnv: "OPENAI_BASE_URL",
    responseFormat: "b64_json",
  },
  together: {
    id: "together",
    label: "Budget Image",
    credits: 2,
    baseUrl: "https://api.together.xyz/v1",
    defaultModel: "black-forest-labs/FLUX.1-schnell-Free",
    apiKeyEnv: "TOGETHER_API_KEY",
    modelEnv: "TOGETHER_IMAGE_MODEL",
    baseUrlEnv: "TOGETHER_BASE_URL",
    responseFormat: "b64_json",
  },
  none: {
    id: "none",
    label: "No image (caption only)",
    credits: 0,
    baseUrl: "",
    defaultModel: "",
    apiKeyEnv: "",
    modelEnv: "",
    baseUrlEnv: "",
    responseFormat: "b64_json",
  },
};

export const DEFAULT_IMAGE_PROVIDER = "openai-dalle3";

export function getTextProvider(id?: string): TextProviderConfig {
  return TEXT_PROVIDERS[id || DEFAULT_TEXT_PROVIDER] || TEXT_PROVIDERS[DEFAULT_TEXT_PROVIDER];
}

export function getImageProvider(id?: string): ImageProviderConfig {
  return IMAGE_PROVIDERS[id || DEFAULT_IMAGE_PROVIDER] || IMAGE_PROVIDERS[DEFAULT_IMAGE_PROVIDER];
}

export function resolveTextConfig(id?: string) {
  const provider = getTextProvider(id);
  return {
    provider,
    baseUrl: process.env[provider.baseUrlEnv] || provider.baseUrl,
    model: process.env[provider.modelEnv] || provider.defaultModel,
    apiKey: process.env[provider.apiKeyEnv],
  };
}

export function resolveImageConfig(id?: string) {
  const provider = getImageProvider(id);
  return {
    provider,
    baseUrl: process.env[provider.baseUrlEnv] || provider.baseUrl,
    model: process.env[provider.modelEnv] || provider.defaultModel,
    apiKey: provider.apiKeyEnv ? process.env[provider.apiKeyEnv] : undefined,
  };
}

/** Options safe to expose to the client for picking a provider in the UI. */
export function listTextProviders() {
  return Object.values(TEXT_PROVIDERS).map(({ id, label, credits }) => ({ id, label, credits }));
}

export function listImageProviders() {
  return Object.values(IMAGE_PROVIDERS).map(({ id, label, credits }) => ({ id, label, credits }));
}

export function getTextProviderCredits(id?: string): number {
  return getTextProvider(id).credits;
}

export function getImageProviderCredits(id?: string): number {
  return getImageProvider(id).credits;
}

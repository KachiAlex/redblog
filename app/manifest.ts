import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReelBlog — Turn Your Instagram Reels Into a Blog",
    short_name: "ReelBlog",
    description:
      "Connect your Instagram account and automatically publish your Reels as a beautiful, playable blog.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ec4899",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

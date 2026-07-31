import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RedBlog — Turn Your Instagram Reels Into a Blog",
    short_name: "RedBlog",
    description:
      "Connect your Instagram account and automatically publish your Reels as a beautiful, playable blog.",
    start_url: "/",
    display: "standalone",
    background_color: "#121014",
    theme_color: "#e8402c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

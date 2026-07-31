"use client";

import { useEffect, useRef } from "react";

export function PostEmbed({ embedHtml }: { embedHtml: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !embedHtml) return;

    const container = containerRef.current;
    container.innerHTML = embedHtml;

    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      newScript.async = true;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [embedHtml]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
    />
  );
}

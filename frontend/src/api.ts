import type { Resume, Theme } from "./types.js";

export async function renderResume(
  resume: Resume,
  theme: Theme = "classic",
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(`/api/render?theme=${theme}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resume),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Render failed: ${response.status}`);
  }
  return response.text();
}

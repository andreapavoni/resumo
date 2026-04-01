import type { RenderResult, Resume, Theme } from "./types.js";

export async function renderResume(
  resume: Resume,
  theme: Theme = "classic",
  locale: string = "en",
  signal?: AbortSignal
): Promise<RenderResult> {
  const response = await fetch(`/api/render?theme=${theme}&locale=${locale}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resume),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Render failed: ${response.status} ${JSON.stringify(response)}`);
  }
  return response.json();
}

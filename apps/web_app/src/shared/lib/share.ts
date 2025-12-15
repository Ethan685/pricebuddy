export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function generateShareUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export async function shareToKakao(payload: { title?: string; text: string; url: string }): Promise<void> {
  const text = [payload.title, payload.text, payload.url].filter(Boolean).join("\n");
  await copyToClipboard(text);
}

export function generateShareText(payload: { title?: string; text: string; url?: string }): string {
  return [payload.title, payload.text, payload.url].filter(Boolean).join("\n");
}

export async function shareText(payload: { title?: string; text: string; url?: string }) {
  if (navigator.share) {
    await navigator.share(payload as any);
    return;
  }
  await copyToClipboard(generateShareText(payload));
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function generateShareUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${window.location.origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function generateShareText(title: string, text: string, url: string): string {
  return [title, text, url].filter(Boolean).join("\n");
}

export async function shareToKakao(url: string, title: string, text: string): Promise<void> {
  const shareText = generateShareText(title, text, url);
  await copyToClipboard(shareText);
}

export async function shareText(payload: { title?: string; text: string; url?: string }) {
  if (navigator.share) {
    await navigator.share(payload as any);
    return;
  }
  const t = [payload.title, payload.text, payload.url].filter(Boolean).join("\n");
  await copyToClipboard(t);
}

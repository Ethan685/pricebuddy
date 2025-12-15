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

type KakaoPayload = { url: string; title: string; text: string };

export async function shareToKakao(payload: KakaoPayload): Promise<void>;
export async function shareToKakao(url: string, title: string, text: string): Promise<void>;
export async function shareToKakao(a: any, b?: any, c?: any): Promise<void> {
  const payload: KakaoPayload =
    typeof a === "string"
      ? { url: String(a), title: String(b ?? ""), text: String(c ?? "") }
      : { url: String(a?.url ?? ""), title: String(a?.title ?? ""), text: String(a?.text ?? "") };

  const shareText = generateShareText(payload.title, payload.text, payload.url);
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

export async function shareText(payload: { title?: string; text: string; url?: string }) {
  if (navigator.share) {
    await navigator.share(payload as any);
    return;
  }
  const text = [payload.title, payload.text, payload.url].filter(Boolean).join("\n");
  await navigator.clipboard.writeText(text);
}

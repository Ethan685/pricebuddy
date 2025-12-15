export function formatDateTime(iso: string | number | Date, locale: string = "ko-KR"): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

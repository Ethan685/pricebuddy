export function formatMoney(value: number, currency: string = "KRW", locale: string = "ko-KR"): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${Math.round(value).toLocaleString(locale)} ${currency}`;
  }
}

export function formatKrw(value: number, locale: string = "ko-KR"): string {
  return formatMoney(value, "KRW", locale);
}

/**
 * 날짜/시간 유틸리티 함수
 */

export function formatDateTime(iso: string | number | Date, locale: string = "ko-KR"): string {
  try {
    const d = iso instanceof Date ? iso : new Date(iso);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "Unknown";
  }
}

export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 0) {
      return "Expired";
    } else if (diffMins < 60) {
      return `${diffMins}m left`;
    } else if (diffHours < 24) {
      return `${diffHours}h left`;
    } else if (diffDays < 7) {
      return `${diffDays}d left`;
    } else {
      return date.toLocaleDateString();
    }
  } catch {
    return "Unknown";
  }
}

export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

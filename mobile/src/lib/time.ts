import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * Short relative times, as the design system asks ("2h", "3d"), switching to a date after a week.
 * The web shows "3 hours ago"; feed rows on a phone need the compact form.
 */
export function formatShortTime(date: string | Date, language: string): string {
    const then = dayjs(date);
    const seconds = dayjs().diff(then, "second");

    if (seconds < 60) return language === "vi" ? "Vừa xong" : "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;

    return then.locale(language).format(then.year() === dayjs().year() ? "D MMM" : "D MMM YYYY");
}

/** "3 hours ago" / "3 giờ trước", for the post detail screen */
export function formatRelativeTime(date: string | Date, language: string): string {
    return dayjs(date).locale(language).fromNow();
}

/** 999, 1.2K, 3.4M: like and view counts on reels, as the web shows them */
export function formatCompactNumber(value: number) {
    const compact = (divisor: number, suffix: string) => `${(value / divisor).toFixed(1).replace(/\.0$/, "")}${suffix}`;
    if (value < 1000) return String(value);
    if (value < 1_000_000) return compact(1000, "K");
    return compact(1_000_000, "M");
}

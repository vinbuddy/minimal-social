/**
 * Escape user input so it can be used safely inside a MongoDB `$regex`
 * (prevents regex injection / ReDoS from patterns like `(a+)+$`).
 * Non-string input (e.g. `?q=a&q=b` parsed as an array) becomes an empty pattern.
 */
export function escapeRegex(input: unknown): string {
    if (typeof input !== "string") return "";
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

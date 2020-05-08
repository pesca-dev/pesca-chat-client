/** Escapes a string for use in a regex. */
export function regexEscape(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

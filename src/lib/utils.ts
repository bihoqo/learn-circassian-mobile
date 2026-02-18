/**
 * Decode common HTML entities in a string.
 *
 * Some dictionary entries are stored with HTML-encoded content inside an outer
 * HTML wrapper (e.g. `&lt;font color=&#39;sienna&#39;&gt;`). Decoding ensures
 * that react-native-render-html receives raw HTML and renders tags correctly.
 *
 * `&amp;` is decoded last so that `&amp;lt;` becomes `&lt;` (not `<`).
 */
/**
 * Escape special LIKE pattern characters for SQLite queries.
 * Use with `ESCAPE '\\'` in the SQL statement.
 */
export function escapeLike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Convert palochka (Ӏ, U+04C0) to the digit "1" and lowercase the result.
 * Used to normalise user input before sending it to the SQLite database,
 * where palochka is stored as "1".
 */
export function normalizeQuery(q: string): string {
  return q.replace(/\u04C0/g, "1").toLowerCase();
}

export function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

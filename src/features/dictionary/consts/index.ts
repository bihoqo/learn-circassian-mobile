export const LANGUAGE_DISPLAY_MAP: Record<string, string> = {
  Ady: "West Circassian",
  Kbd: "East Circassian",
  "Ady/Kbd": "West & East Circassian",
  Ru: "Russian",
  En: "English",
  Tr: "Turkish",
  Ar: "Arabic",
  He: "Hebrew",
};

/** Minimum characters required for "contains" search mode */
export const MIN_CONTAINS_CHARS = 3;

/**
 * Replace the digit "1" with the Cyrillic palochka letter (Ӏ, U+04C0) for display.
 * The database stores palochka as "1" for easier search and storage.
 * The inverse is normalizeQuery() in useDictionarySearch.
 */
export function toPalochka(text: string): string {
  return text.replace(/1/g, "\u04C0");
}

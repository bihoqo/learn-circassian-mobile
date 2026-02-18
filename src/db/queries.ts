import * as SQLite from "expo-sqlite";
import { decodeHtmlEntities, escapeLike } from "@/lib/utils";

export interface IDbDictionary {
  id: number;
  title: string;
  from_lang: string;
  to_lang: string;
}

export interface IDbWordEntry {
  id: number;
  html: string;
}

export interface IDbWordEntryWithDictionary extends IDbWordEntry {
  dictionary: IDbDictionary;
}

export interface IDbWordWithDictionaries {
  word: string;
  entries: IDbWordEntryWithDictionary[];
}

export interface IPaginatedResult {
  data: string[];
  total: number;
  page: number;
  totalPages: number;
}

export function searchWordsStartingWith(
  db: SQLite.SQLiteDatabase,
  query: string,
  page: number,
  limit: number,
): IPaginatedResult {
  const pattern = `${escapeLike(query)}%`;
  const offset = (page - 1) * limit;

  const countRow = db.getFirstSync<{ total: number }>(
    "SELECT COUNT(*) as total FROM words WHERE word LIKE ? ESCAPE '\\'",
    [pattern],
  );

  const rows = db.getAllSync<{ word: string }>(
    "SELECT word FROM words WHERE word LIKE ? ESCAPE '\\' ORDER BY word LIMIT ? OFFSET ?",
    [pattern, limit, offset],
  );

  const total = countRow?.total ?? 0;

  return {
    data: rows.map((r) => r.word),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export function searchWordsContaining(
  db: SQLite.SQLiteDatabase,
  query: string,
  page: number,
  limit: number,
): IPaginatedResult {
  const pattern = `%${escapeLike(query)}%`;
  const offset = (page - 1) * limit;

  const countRow = db.getFirstSync<{ total: number }>(
    "SELECT COUNT(*) as total FROM words WHERE word LIKE ? ESCAPE '\\'",
    [pattern],
  );

  const rows = db.getAllSync<{ word: string }>(
    "SELECT word FROM words WHERE word LIKE ? ESCAPE '\\' ORDER BY word LIMIT ? OFFSET ?",
    [pattern, limit, offset],
  );

  const total = countRow?.total ?? 0;

  return {
    data: rows.map((r) => r.word),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export function getWordWithDictionaries(
  db: SQLite.SQLiteDatabase,
  word: string,
): IDbWordWithDictionaries | null {
  const row = db.getFirstSync<{ word: string; entries: string }>(
    "SELECT word, entries FROM words WHERE word = ?",
    [word],
  );

  if (!row) return null;

  const entries = JSON.parse(row.entries) as IDbWordEntry[];
  const dictIds = [...new Set(entries.map((e) => e.id))];

  if (dictIds.length === 0) return { word: row.word, entries: [] };

  const placeholders = dictIds.map(() => "?").join(", ");
  const dictRows = db.getAllSync<IDbDictionary>(
    `SELECT id, title, from_lang, to_lang FROM dictionaries WHERE id IN (${placeholders})`,
    dictIds,
  );

  const dictMap = new Map(dictRows.map((d) => [d.id, d]));

  return {
    word: row.word,
    entries: entries
      .filter((e) => dictMap.has(e.id))
      .map((entry) => ({
        ...entry,
        html: decodeHtmlEntities(entry.html),
        dictionary: dictMap.get(entry.id)!,
      })),
  };
}

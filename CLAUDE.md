# Learn Circassian Mobile - AI Instructions

## Project Overview

An offline React Native / Expo app for learning the Circassian language. The primary feature is a dictionary that works fully offline using a locally-stored SQLite database.

**Tech stack:** Expo SDK 54, React Native 0.81, TypeScript (strict), expo-sqlite v16, TanStack Query v5, Zustand v5, AsyncStorage

## Key Rules

1. **Always update AI instruction files** (`CLAUDE.md`) and `README.md` when making structural changes, changing conventions, or modifying the tech stack.
2. **Use npm with `--legacy-peer-deps`** for package management (React 19.1 vs peer deps expecting 19.2). Bun also works but npm is the default.
3. **Use the `@` path alias** for all internal imports (`@/lib/...`, `@/features/...`, `@/db/...`). Configured in `babel.config.js` via `babel-plugin-module-resolver`.
4. **TypeScript strict mode.** No `any` types.
5. **No Tailwind / NativeWind.** Use `StyleSheet.create` with the `useTheme()` hook.
6. **Terminology:** Always use "West Circassian" (not Adyghe) and "East Circassian" (not Kabardian) in UI labels and comments.

## Database

- The dictionary database (~242 MB) is **not bundled** in the app source.
- At runtime, the app downloads it once from GitHub Releases to `FileSystem.documentDirectory/SQLite/dictionary.db`.
- For local dev inspection: `npm run db:download` → places at `assets/dictionary.db` (gitignored).
- Download URL: `https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db`

### DB Schema
- `dictionaries`: `(id, title, from_lang, to_lang)`
- `words`: `(word PK, entries JSON)` — entries = `[{id, html}, …]`

### Palochka Convention
- Stored as digit `"1"` in DB, displayed as `Ӏ` (U+04C0)
- `toPalochka(text)` in `src/features/dictionary/consts/` converts `"1"` → `"Ӏ"` for display
- `normalizeQuery(q)` in `src/lib/utils.ts` converts `"Ӏ"` → `"1"` before queries

## Project Structure

```
app/
  _layout.tsx           # Root: DB download/check flow, SQLiteProvider, QueryClientProvider
  index.tsx             # Search screen
  word/[word].tsx        # Word detail screen
assets/
  dictionary.db         # Optional local DB copy (gitignored)
scripts/
  download-db.mjs       # Downloads DB to assets/dictionary.db
src/
  db/
    queries.ts          # SQLite queries: searchWordsStartingWith, searchWordsContaining, getWordWithDictionaries
  features/dictionary/
    components/         # LanguageFilter, SearchInput, SearchResultsList, WordEntryCard
    consts/             # toPalochka(), LANGUAGE_DISPLAY_MAP, MIN_CONTAINS_CHARS
    hooks/              # useDictionarySearch (infinite query), useWordLookup
    store/              # useDictionaryStore (Zustand: search mode, language filters)
  lib/
    useTheme.ts         # Returns typed COLORS object based on dark/light mode
    utils.ts            # normalizeQuery, escapeLike, decodeHtmlEntities, toPalochka
  shared/store/
    useThemeStore.ts    # Zustand: dark/light, persisted via AsyncStorage
```

## First-Run Download Flow

`app/_layout.tsx` orchestrates first-run setup:
1. Checks if `FileSystem.documentDirectory/SQLite/dictionary.db` exists
2. If not → shows `SetupScreen` with a download button
3. Download uses `FileSystem.createDownloadResumable` with progress callback
4. On success → renders `SQLiteProvider` → `AppNavigator`

## Testing

Bun's built-in test runner. Run: `npm test` (or `bun test`). Test files in `__tests__/` next to code.

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` | Open in Android emulator |
| `npm run build:android` | EAS cloud APK build |
| `npm run db:download` | Download DB to assets/ for local inspection |
| `npm test` | Run unit tests |

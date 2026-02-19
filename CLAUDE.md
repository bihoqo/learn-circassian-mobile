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
  index.tsx             # Search screen (gear icon → settings, theme toggle)
  settings.tsx          # Settings screen (DB path/URL, remove instructions, version)
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
2. If not → shows `SetupScreen` with a download button + manual install instructions (DB URL and path)
3. Download uses `FileSystem.createDownloadResumable` with progress callback
4. On success → renders `SQLiteProvider` → `AppNavigator`

## DB Detection (3 checkpoints)

The app checks whether the DB exists at three points, redirecting to `SetupScreen` if missing:
1. **App entry** — `_layout.tsx` `useEffect` calls `FileSystem.getInfoAsync(DB_PATH)`
2. **Search failure** — `QueryCache({ onError })` checks DB existence and calls `needsSetupRef.current()`
3. **Exit Settings** — `handleBack()` in `settings.tsx` calls `FileSystem.getInfoAsync(DB_PATH)` before navigating back

`needsSetupRef` is a module-level `{ current: () => {} }` ref exported from `_layout.tsx`, updated by `RootLayout` via `useEffect` to point at `setDbState("needs_setup")`.

## Releases (APK)

- Build: `eas build --platform android --profile preview --non-interactive`
- Uses `credentials.json` (gitignored) with local keystore for signing on Expo's servers
- **Before each release, bump `version` in `app.json`** (e.g. `"1.0.0"` → `"1.1.0"`)
  - The Settings screen reads this via `Constants.expoConfig?.version`
- Upload the `.apk` from the EAS build URL to the GitHub Release as an asset
- `credentials.json`, `android-release.keystore`, and `android/app/debug.keystore` must NEVER be committed (all in `.gitignore`)

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

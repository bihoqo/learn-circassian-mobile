# Learn Circassian Mobile - AI Instructions

## Project Overview

An offline React Native / Expo app for learning the Circassian language. The primary feature is a dictionary that works fully offline using a locally-stored SQLite database.

**Tech stack:** Expo SDK 54, React Native 0.81, TypeScript (strict), expo-sqlite v16, TanStack Query v5, Zustand v5, AsyncStorage

## Key Rules

1. **Always update AI instruction files** (`CLAUDE.md`) and `README.md` when making structural changes, changing conventions, or modifying the tech stack.
2. **Use npm with `--legacy-peer-deps`** for package management. Bun also works.
3. **Use the `@` path alias** for all internal imports. Configured in `babel.config.js`.
4. **TypeScript strict mode.** No `any` types.
5. **No Tailwind / NativeWind.** Use `StyleSheet.create` with the `useTheme()` hook.
6. **Terminology:** Always use "West Circassian" (not Adyghe) and "East Circassian" (not Kabardian).

## Database

- The dictionary database (~242 MB) is **not bundled** in the app source.
- At runtime, the app downloads it once from GitHub Releases to `FileSystem.documentDirectory/SQLite/dictionary.db`.
- For local dev inspection: `npm run db:download` → places at `assets/dictionary.db` (gitignored).
- Download URL: `https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db`

### Palochka Convention
- Stored as `"1"` in DB, displayed as `Ӏ` (U+04C0)
- `toPalochka(text)` → `"1"` to `"Ӏ"` for display
- `normalizeQuery(q)` → `"Ӏ"` to `"1"` before DB queries

## Project Structure

```
app/
  _layout.tsx           # Root: DB check/download, SQLiteProvider, QueryClientProvider
  index.tsx             # Search screen
  word/[word].tsx        # Word detail screen
src/
  db/queries.ts          # SQLite queries
  features/dictionary/   # Components, consts, hooks, store
  lib/utils.ts           # normalizeQuery, escapeLike, decodeHtmlEntities
  lib/useTheme.ts        # Dark/light COLORS object
  shared/store/          # useThemeStore (Zustand + AsyncStorage)
scripts/
  download-db.mjs        # Downloads DB to assets/dictionary.db
```

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run android` | Open in Android emulator |
| `npm run build:android` | EAS cloud APK build |
| `npm run db:download` | Download DB to assets/ for local inspection |
| `npm test` | Run unit tests |

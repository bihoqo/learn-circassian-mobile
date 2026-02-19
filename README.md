# Learn Circassian Mobile

An offline Android dictionary for the Circassian languages (West Circassian and East Circassian). Search across 35+ bilingual dictionaries entirely on-device — no internet connection required after the first-run download.

Built with **Expo SDK 54**, **React Native 0.81**, **expo-sqlite v16**, **expo-updates**, and **Zustand 5**.

---

## Features

- **Offline-first** — the full 242 MB SQLite database is downloaded once on first launch and stored on-device; no network needed after that
- **35+ dictionaries** — Circassian paired with Russian, English, Turkish, Arabic, and more
- **Two search modes** — "Starts with" (fast prefix search) or "Contains" (substring search, 3+ chars)
- **Paginated results** — 50 results per page with a "Show more" button
- **Word detail view** — all dictionary entries for a word, rendered as HTML, expandable cards
- **Language filters** — filter entries by source language (From) and target language (To)
- **Dark / light mode** — toggle in the header, persisted across restarts via AsyncStorage
- **Palochka support** — the Circassian palochka (Ӏ) is handled correctly throughout
- **OTA updates** — the Auto-Update APK variant receives JavaScript updates automatically via Expo EAS Update

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | 18 LTS or later | Required by Expo tooling |
| [npm](https://www.npmjs.com/) | 9+ | Use with `--legacy-peer-deps` (see below) |
| [Expo Go](https://expo.dev/go) | Latest | For quick testing on a physical device |
| Android device or emulator | Android 10+ | For running the app |
| [EAS CLI](https://docs.expo.dev/eas/) | Latest | For cloud APK builds |

### Package manager note

Use **npm** with `--legacy-peer-deps` for this project (React 19.1 vs peer deps expecting 19.2). Bun also works for most commands.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/bihoqo/learn-circassian-mobile.git
cd learn-circassian-mobile
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Start the development server

```bash
npm start
# or: npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your Android device, or press `a` to open in an Android emulator. On first launch the app shows a **"Download Dictionary"** screen — tap the button to download the 242 MB database over Wi-Fi. This happens once; subsequent launches open directly to the search screen.

---

## Dictionary Database

The 242 MB SQLite database is **not bundled** in the app source. It is downloaded at runtime on first launch from:

```
https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db
```

For local development inspection (e.g. running queries against the DB directly), you can also download it to your machine:

```bash
npm run db:download
# places the file at: assets/dictionary.db
```

Re-running is a no-op if the file already exists.

---

## APK Variants

Two APK variants are published with each release:

| Variant | Filename | Auto-updates |
|---------|----------|-------------|
| **Standalone** | `Learn-Circassian-Mobile-X.X.X.apk` | No — install a new APK for updates |
| **Auto-Update** | `Learn-Circassian-Mobile-X.X.X-AutoUpdate.apk` | Yes — receives JS-only updates automatically via Expo EAS Update |

**Which should I install?**

- Use **Standalone** if you prefer full control over when updates happen, or if you want to stay on a fixed version.
- Use **Auto-Update** if you want to receive bug fixes and UI improvements automatically without reinstalling.

**What OTA updates can and cannot do:**

OTA (over-the-air) updates via Expo EAS Update can push **JavaScript changes** (UI, search logic, layout, bug fixes) automatically. They **cannot** update native code (new Android permissions, new native modules, SQLite changes). Native changes always require a new APK.

---

## Building an APK

### Option A — EAS Build (cloud, recommended)

```bash
# Install EAS CLI once, globally
npm install -g eas-cli

# Log in to your Expo account (create one at https://expo.dev if needed)
eas login

# Build the standalone APK (no auto-updates)
eas build --platform android --profile preview
# or:
npm run build:android

# Build the auto-update APK (receives OTA JS updates)
eas build --platform android --profile preview-updates
# or:
npm run build:android-updates
```

When the build finishes, EAS prints a download URL for the `.apk`. Install it on any Android device.

**Build profiles** are in `eas.json`:

```json
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "preview-updates": {
      "channel": "preview",
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": { "android": { "buildType": "app-bundle" } }
  }
}
```

### Pushing an OTA update

After building an `preview-updates` APK, you can push JS-only updates without rebuilding:

```bash
eas update --branch preview --message "Fix search results layout"
```

All devices running the Auto-Update APK will receive the update on next app launch.

### Option B — Local Build (requires Android Studio + JDK 17+)

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
```

---

## Project Structure

```
learn-circassian-mobile/
├── app/
│   ├── _layout.tsx            # Root: DB download/check, SQLiteProvider, QueryClientProvider
│   ├── index.tsx              # Search screen
│   ├── settings.tsx           # Settings screen (DB info, remove instructions, version)
│   └── word/
│       └── [word].tsx         # Word detail screen
├── assets/
│   └── dictionary.db          # Local DB copy (optional, gitignored — app downloads at runtime)
├── scripts/
│   └── download-db.mjs        # Downloads DB to assets/dictionary.db for local inspection
├── src/
│   ├── db/
│   │   └── queries.ts         # SQLite query functions (search + word lookup)
│   ├── features/dictionary/
│   │   ├── components/        # LanguageFilter, SearchInput, SearchResultsList, WordEntryCard
│   │   ├── consts/            # toPalochka(), LANGUAGE_DISPLAY_MAP, MIN_CONTAINS_CHARS
│   │   ├── hooks/             # useDictionarySearch, useWordLookup
│   │   └── store/             # Zustand: search mode, language filters
│   ├── lib/
│   │   ├── useTheme.ts        # Returns typed COLORS object (dark/light)
│   │   └── utils.ts           # normalizeQuery, escapeLike, decodeHtmlEntities
│   └── shared/store/
│       └── useThemeStore.ts   # Zustand: dark/light, persisted via AsyncStorage
├── app.json                   # Expo config (version, runtimeVersion, updates URL)
├── eas.json                   # EAS build profiles (preview, preview-updates, production)
├── babel.config.js            # babel-preset-expo + module-resolver (@/ → src/)
├── metro.config.js            # Metro config (default)
├── tsconfig.json              # TypeScript strict, @/ path alias → src/
└── package.json
```

---

## Architecture

### Database

Two SQLite tables:

| Table | Columns | Description |
|-------|---------|-------------|
| `dictionaries` | `id`, `title`, `from_lang`, `to_lang` | One row per dictionary source |
| `words` | `word` (PK), `entries` (JSON) | One row per headword; entries = `[{id, html}, …]` |

The app downloads `dictionary.db` to `FileSystem.documentDirectory/SQLite/dictionary.db` on first launch. `SQLiteProvider` (expo-sqlite v16) opens it from there.

### Search

| Mode | SQL | Min chars |
|------|-----|-----------|
| Starts with | `WHERE word LIKE 'query%' ESCAPE '\'` | 1 |
| Contains | `WHERE word LIKE '%query%' ESCAPE '\'` | 3 |

Results are paginated 50 per page.

### Palochka Convention

The Circassian palochka (Ӏ, U+04C0) is stored as `1` in the database:

- **`toPalochka(text)`** — `1` → `Ӏ` for display
- **`normalizeQuery(q)`** — `Ӏ` → `1` before database queries

---

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Open in Android emulator |
| `npm run build:android` | Build standalone APK via EAS |
| `npm run build:android-updates` | Build auto-update APK via EAS |
| `npm run db:download` | Download DB to `assets/dictionary.db` for local inspection |
| `npm test` | Run unit tests (Bun test runner) |

---

## Testing

Uses Bun's built-in test runner:

```bash
npm test
```

Tests live in `__tests__/` directories next to the code they test.

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [`learn-circassian-web`](https://github.com/bihoqo/learn-circassian-web) | Next.js web dictionary app |
| [`learn-circassian-desktop`](https://github.com/bihoqo/learn-circassian-desktop) | Electron desktop app (Windows / macOS / Linux) |
| [`learn-circassian-dictionary-collection`](https://github.com/bihoqo/learn-circassian-dictionary-collection) | SQLite dictionary database releases |

---

## License

MIT

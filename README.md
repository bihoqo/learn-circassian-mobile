# Circassian Dictionary — Mobile App

An offline Android dictionary for the Circassian languages (West Circassian / Adyghe and East Circassian / Kabardian). Search across 35+ bilingual dictionaries entirely on-device — no internet connection required.

Built with **Expo SDK 54**, **React Native 0.81**, **expo-sqlite v16**, and **Zustand 5**.

---

## Features

- **Offline-first** — the full 242 MB SQLite database is bundled into the APK; no network needed at any point
- **35+ dictionaries** — Circassian paired with Russian, English, Turkish, Arabic, and more
- **Two search modes** — "Starts with" (fast prefix search) or "Contains" (substring search, 3+ chars)
- **Paginated results** — 50 results per page with a "Show more" button
- **Word detail view** — all dictionary entries for a word, rendered as HTML, expandable cards
- **Language filters** — filter entries by source language (From) and target language (To)
- **Dark / light mode** — toggle in the header, persisted across restarts via AsyncStorage
- **Palochka support** — the Circassian palochka (Ӏ) is handled correctly throughout

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | 18 LTS or later | Required by Expo tooling |
| [Bun](https://bun.sh/) | 1.3+ | Recommended. npm also works — see below |
| [Expo Go](https://expo.dev/go) | Latest | For quick testing on a physical device (no build needed) |
| Android device or emulator | Android 10+ | For running the app |
| [EAS CLI](https://docs.expo.dev/eas/) | Latest | For cloud APK builds (`npm i -g eas-cli`) |

### Can I use npm instead of bun?

Yes. Everywhere this guide says `bun install`, substitute `npm install --legacy-peer-deps`. Everywhere it says `bunx`, substitute `npx`. The `db:assemble` script uses plain Node.js and works with either.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/learn-circassian-mobile.git
cd learn-circassian-mobile
```

### 2. Install dependencies

```bash
bun install
# npm alternative: npm install --legacy-peer-deps
```

### 3. Assemble the database

The 242 MB SQLite database is **split into three ~81 MB chunks** (each safely under GitHub's 100 MB file limit) and committed to the repository under `assets/db/`. Run the following command once to reassemble them:

```bash
bun run db:assemble
# or: node scripts/assemble-db.mjs
```

This creates `assets/dictionary.db` (which is gitignored). You only need to do this **once**. If you regenerate the database, delete `assets/dictionary.db` and run the command again.

> **Alternative (if you also have the `learn-circassian-web` repo):**
> ```bash
> # Replace the symlink/file with a symlink to the web repo's copy
> ln -sf ../../learn-circassian-web/data/dictionary.db assets/dictionary.db
> ```
> This lets both repos share the same file on disk and always stay in sync.

### 4. Start the development server

```bash
bun run start
# or: bunx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your Android device, or press `a` to open in an Android emulator.

---

## Running on a Physical Android Device

1. Enable **Developer Options** → **USB Debugging** on your device.
2. Connect via USB.
3. Run `bunx expo start --android` (or press `a` in the Expo terminal UI).
4. Expo Go opens the app on your device automatically.

For a standalone build that installs without Expo Go, see [Building an APK](#building-an-apk) below.

---

## Building an APK

### Option A — EAS Build (cloud, recommended)

EAS Build compiles the app in the cloud. Free tier is sufficient for personal use.

```bash
# Install EAS CLI (once, globally)
npm install -g eas-cli

# Log in to your Expo account (create one at https://expo.dev if needed)
eas login

# Build a preview APK (installable on any Android device via sideloading)
eas build --platform android --profile preview
# or use the shortcut defined in package.json:
bun run build:android
```

When the build finishes, EAS prints a download URL for the `.apk` file. Install it on any Android device.

**Build profiles** are configured in `eas.json`. The default `preview` profile produces an APK; the `production` profile produces an AAB (Android App Bundle) for Play Store submission. Create `eas.json` if it doesn't exist:

```json
{
  "cli": { "version": ">= 14.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

> **Note on database bundling:** The `assets/dictionary.db` file (242 MB) is bundled into the APK/AAB automatically by Metro. The final APK will be ~250+ MB. EAS Build requires the file to be present locally (not a broken symlink) before uploading the build context — run `bun run db:assemble` first.

### Option B — Local Build (requires Android Studio + JDK 17+)

```bash
# Generate the native Android project
bunx expo prebuild --platform android

# Build the debug APK
cd android && ./gradlew assembleDebug

# Build the release APK (requires a signing key)
cd android && ./gradlew assembleRelease
```

The APK is output to `android/app/build/outputs/apk/`.

---

## Project Structure

```
learn-circassian-mobile/
├── app/
│   ├── _layout.tsx            # Root layout: SQLiteProvider, QueryClientProvider, theme sync
│   ├── index.tsx              # Search screen (main page)
│   └── word/
│       └── [word].tsx         # Word detail screen
├── assets/
│   ├── db/
│   │   ├── dictionary.db.part1    # DB chunk 1/3 (~81 MB) — committed to git ✅
│   │   ├── dictionary.db.part2    # DB chunk 2/3 (~81 MB) — committed to git ✅
│   │   └── dictionary.db.part3    # DB chunk 3/3 (~81 MB) — committed to git ✅
│   └── dictionary.db              # Assembled DB (242 MB) — gitignored ❌
├── scripts/
│   └── assemble-db.mjs        # Concatenates the three chunks into dictionary.db
├── src/
│   ├── db/
│   │   └── queries.ts         # SQLite query functions (search + word lookup)
│   ├── features/dictionary/
│   │   ├── components/
│   │   │   ├── LanguageFilter.tsx     # From/To language chips
│   │   │   ├── SearchInput.tsx        # Text input + mode chips
│   │   │   ├── SearchResultsList.tsx  # Paginated results list
│   │   │   └── WordEntryCard.tsx      # Expandable dictionary entry card
│   │   ├── consts/
│   │   │   └── index.ts       # toPalochka(), LANGUAGE_DISPLAY_MAP, MIN_CONTAINS_CHARS
│   │   ├── hooks/
│   │   │   ├── useDictionarySearch.ts  # Infinite query for search
│   │   │   └── useWordLookup.ts        # Single-word query
│   │   └── store/
│   │       └── useDictionaryStore.ts   # Zustand: search mode, language filters
│   ├── lib/
│   │   ├── useTheme.ts        # Returns typed COLORS object based on dark/light
│   │   └── utils.ts           # decodeHtmlEntities
│   └── shared/store/
│       └── useThemeStore.ts   # Zustand: dark/light, persisted via AsyncStorage
├── app.json                   # Expo config (scheme, plugins, android package name)
├── babel.config.js            # babel-preset-expo (reanimated: false) + module-resolver
├── metro.config.js            # .db asset extension + watchFolders for symlink support
├── tsconfig.json              # TypeScript (strict, @/ path alias → src/)
└── package.json
```

---

## Architecture & Technical Notes

### Database

The dictionary database (`dictionary.db`, ~242 MB) has two SQLite tables:

| Table | Columns | Description |
|-------|---------|-------------|
| `dictionaries` | `id`, `title`, `from_lang`, `to_lang` | One row per dictionary source |
| `words` | `word` (PK), `entries` (JSON) | One row per headword; entries = `[{id, html}, …]` |

The `id` in each JSON entry references `dictionaries.id` to get the dictionary title and language pair.

On first launch, expo-sqlite's `SQLiteProvider` with `assetSource` copies `dictionary.db` from the app bundle to the device's SQLite directory. Subsequent launches reuse the copied file (no re-copy). Queries use **expo-sqlite v16's synchronous API** wrapped in **TanStack Query v5** for async pagination and caching.

### Search Implementation

| Mode | SQL | Min chars |
|------|-----|-----------|
| Starts with | `WHERE word LIKE 'query%' ESCAPE '\'` | 1 |
| Contains | `WHERE word LIKE '%query%' ESCAPE '\'` | 3 (prevents huge result sets) |

Results are paginated 50 per page using `LIMIT` / `OFFSET`. The total page count is computed from a `COUNT(*)` query on the same filter.

### Palochka Convention

The Circassian palochka letter (Ӏ, U+04C0) is stored as the digit `1` in the database for simpler indexing and search. The app converts in both directions:

- **`toPalochka(text)`** — `1` → `Ӏ` for all display text
- **`normalizeQuery(q)`** — `Ӏ` → `1` before sending to the database

### Theme

Dark/light mode is stored in Zustand v5 (persisted via `AsyncStorage`). The `useTheme()` hook returns a typed `COLORS` object used with React Native `StyleSheet.create`. No Tailwind / NativeWind is used.

### Why not NativeWind?

NativeWind v4 requires Tailwind CSS v3, but installing the latest `tailwindcss` gives v4. These are incompatible. Rather than version-pinning, the app uses a custom `useTheme()` + `StyleSheet` approach that is simpler and dependency-free.

---

## Database: How the Chunks Work

GitHub enforces a **100 MB hard limit** on individual files pushed via git. The full database is ~242 MB and cannot be committed directly.

**Solution:** the database is split into three ~81 MB parts using the `split` command. All three parts are committed to git. The `db:assemble` script concatenates them back:

```
assets/db/dictionary.db.part1   ~81 MB  ✅ in git
assets/db/dictionary.db.part2   ~81 MB  ✅ in git
assets/db/dictionary.db.part3   ~81 MB  ✅ in git
───────────────────────────────────────────────
assets/dictionary.db            ~242 MB  ❌ gitignored, built locally
```

### Re-splitting the database (if you regenerate it)

```bash
# Linux / macOS
split -b 84653398 --suffix-length=1 --numeric-suffixes=1 \
  /path/to/dictionary.db assets/db/dictionary.db.part

# Windows (PowerShell)
$bytes = [System.IO.File]::ReadAllBytes("dictionary.db")
$size  = 84653398
for ($i = 1; $i -le 3; $i++) {
  $start = ($i - 1) * $size
  $len   = [Math]::Min($size, $bytes.Length - $start)
  [System.IO.File]::WriteAllBytes("assets/db/dictionary.db.part$i", $bytes[$start..($start+$len-1)])
}
```

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [`learn-circassian-web`](https://github.com/YOUR_USERNAME/learn-circassian-web) | Next.js web dictionary app (same data, same features) |
| [`learn-circassian-desktop`](https://github.com/YOUR_USERNAME/learn-circassian-desktop) | Electron desktop app (Windows / macOS / Linux) |
| [`learn-circassian-dict-format-converter`](https://github.com/YOUR_USERNAME/learn-circassian-dict-format-converter) | Go pipeline that built `dictionary.db` from 35+ raw dictionary formats |

---

## Regenerating the Database

If you want to rebuild `dictionary.db` from scratch, use the [`learn-circassian-dict-format-converter`](https://github.com/YOUR_USERNAME/learn-circassian-dict-format-converter) repository:

```bash
git clone https://github.com/YOUR_USERNAME/learn-circassian-dict-format-converter
cd learn-circassian-dict-format-converter
go run main.go
# Output: content/phase-05-sqlite/dictionary.db
```

Requires Go 1.25+. No CGO needed (uses `modernc.org/sqlite`).

---

## Contributing

1. Fork the repository and create a feature branch
2. Run `bun install` then `bun run db:assemble`
3. Make your changes and test on a device or emulator
4. Open a pull request with a clear description

---

## License

MIT

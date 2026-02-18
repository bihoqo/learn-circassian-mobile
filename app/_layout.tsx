import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "@/lib/useTheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: Infinity,
    },
  },
});

// ─── paths ────────────────────────────────────────────────────────────────────

const DB_DIR = `${FileSystem.documentDirectory}SQLite/`;
const DB_PATH = `${DB_DIR}dictionary.db`;

const DB_URL =
  "https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db";

// ─── download ─────────────────────────────────────────────────────────────────

async function downloadDatabase(
  onProgress: (info: { pct: number; downloadedMB: number; totalMB: number }) => void
): Promise<void> {
  await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });

  const tmpPath = DB_PATH + ".tmp";

  const resumable = FileSystem.createDownloadResumable(
    DB_URL,
    tmpPath,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      const total = totalBytesExpectedToWrite || 253_000_000;
      onProgress({
        pct: totalBytesWritten / total,
        downloadedMB: totalBytesWritten / 1_048_576,
        totalMB: total / 1_048_576,
      });
    }
  );

  const result = await resumable.downloadAsync();
  if (!result?.uri) {
    await FileSystem.deleteAsync(tmpPath, { idempotent: true });
    throw new Error("Download did not complete.");
  }
  // Rename .tmp → final
  await FileSystem.moveAsync({ from: tmpPath, to: DB_PATH });
}

// ─── SetupScreen ──────────────────────────────────────────────────────────────

function SetupScreen({ onDone }: { onDone: () => void }) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [downloadInfo, setDownloadInfo] = useState({ pct: 0, downloadedMB: 0, totalMB: 0 });
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSetup() {
    setStatus("working");
    setDownloadInfo({ pct: 0, downloadedMB: 0, totalMB: 0 });
    setErrorMsg("");
    try {
      await downloadDatabase((info) => setDownloadInfo(info));
      onDone();
    } catch (e) {
      await FileSystem.deleteAsync(DB_PATH, { idempotent: true });
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  const isWorking = status === "working";

  return (
    <View style={styles.setupContainer}>
      <StatusBar style="light" />
      <Image
        source={require("../assets/icon.png")}
        style={styles.setupLogo}
        resizeMode="contain"
      />
      <Text style={styles.setupTitle}>Learn Circassian</Text>
      <Text style={styles.setupSubtitle}>One-time download required</Text>
      <Text style={styles.setupBody}>
        The dictionary database (~242 MB) needs to be downloaded once over Wi-Fi.
      </Text>

      {status === "error" && (
        <Text style={styles.setupError}>{errorMsg}</Text>
      )}

      {isWorking ? (
        <View style={styles.progressContainer}>
          <ActivityIndicator color="#067d35" size="large" />
          <Text style={styles.progressLabel}>
            Downloading… {downloadInfo.downloadedMB.toFixed(0)} / {downloadInfo.totalMB.toFixed(0)} MB
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${downloadInfo.pct * 100}%` }]} />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.setupButton}
          onPress={handleSetup}
          activeOpacity={0.85}
        >
          <Text style={styles.setupButtonText}>
            {status === "error" ? "Try Again" : "Download Dictionary (~242 MB)"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main navigator (shown once DB is ready) ──────────────────────────────────

function AppNavigator() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700", color: colors.text },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="word/[word]"
          options={{ title: "Definition", headerBackTitle: "Search" }}
        />
      </Stack>
    </>
  );
}

function DbLoadingFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator color="#067d35" size="large" />
      <Text style={styles.fallbackText}>Loading dictionary…</Text>
    </View>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────────────

type DbState = "checking" | "needs_setup" | "ready";

export default function RootLayout() {
  const [dbState, setDbState] = useState<DbState>("checking");

  useEffect(() => {
    FileSystem.getInfoAsync(DB_PATH)
      .then((info) => {
        setDbState(info.exists ? "ready" : "needs_setup");
      })
      .catch(() => setDbState("needs_setup"))
      .finally(() => SplashScreen.hideAsync());
  }, []);

  if (dbState === "checking") {
    return (
      <View style={styles.fallback}>
        <StatusBar style="light" />
        <ActivityIndicator color="#067d35" size="large" />
      </View>
    );
  }

  if (dbState === "needs_setup") {
    return (
      <QueryClientProvider client={queryClient}>
        <SetupScreen onDone={() => setDbState("ready")} />
      </QueryClientProvider>
    );
  }

  // DB is ready — open it (no assetSource: we placed the file ourselves)
  return (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={<DbLoadingFallback />}>
        <SQLiteProvider databaseName="dictionary.db" useSuspense>
          <AppNavigator />
        </SQLiteProvider>
      </React.Suspense>
    </QueryClientProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#0f0f0f",
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f4f4f5",
  },

  setupContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 32,
    gap: 12,
  },
  setupLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 8,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f4f4f5",
    letterSpacing: -0.5,
  },
  setupSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#067d35",
  },
  setupBody: {
    fontSize: 14,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 8,
  },
  setupError: {
    fontSize: 13,
    color: "#f87171",
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#a1a1aa",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "#27272a",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#067d35",
    borderRadius: 3,
  },
  setupButton: {
    backgroundColor: "#067d35",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    minWidth: 220,
    alignItems: "center",
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});

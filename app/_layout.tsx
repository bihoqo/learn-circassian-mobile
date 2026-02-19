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
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "@/lib/useTheme";

SplashScreen.preventAutoHideAsync();

// ─── DB paths & URL ───────────────────────────────────────────────────────────

export const DB_DIR = `${FileSystem.documentDirectory}SQLite/`;
export const DB_PATH = `${DB_DIR}dictionary.db`;

export const DB_URL =
  "https://github.com/bihoqo/learn-circassian-dictionary-collection/releases/latest/download/dictionary.db";

// ─── Module-level ref so QueryCache onError can redirect to setup ─────────────

export const needsSetupRef = { current: () => {} };

// ─── QueryClient with global error → DB-missing detection ────────────────────

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => {
      FileSystem.getInfoAsync(DB_PATH)
        .then((info) => {
          if (!info.exists) needsSetupRef.current();
        })
        .catch(() => needsSetupRef.current());
    },
  }),
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: Infinity,
    },
  },
});

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

      {/* Manual / info section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>Or install manually</Text>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNum}>1</Text>
          <Text style={styles.infoStepText}>
            Download{" "}
            <Text style={styles.infoLink}>dictionary.db</Text>
            {" "}from:
          </Text>
        </View>
        <Text style={styles.infoCode} selectable>{DB_URL}</Text>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNum}>2</Text>
          <Text style={styles.infoStepText}>
            Place it at the following path using ADB or a file manager with root access:
          </Text>
        </View>
        <Text style={styles.infoCode} selectable>{DB_PATH}</Text>
        <View style={styles.infoStep}>
          <Text style={styles.infoStepNum}>3</Text>
          <Text style={styles.infoStepText}>Restart the app — it will open automatically.</Text>
        </View>
      </View>
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
        <Stack.Screen name="settings" options={{ headerShown: false }} />
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

// ─── Root layout ──────────────────────────────────────────────────────────────

type DbState = "checking" | "needs_setup" | "ready";

export default function RootLayout() {
  const [dbState, setDbState] = useState<DbState>("checking");

  // Keep needsSetupRef pointing at our setter so QueryCache.onError and
  // the settings screen can both trigger a redirect to setup.
  useEffect(() => {
    needsSetupRef.current = () => setDbState("needs_setup");
    return () => {
      needsSetupRef.current = () => {};
    };
  }, []);

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

  // Manual install / info section
  infoSection: {
    width: "100%",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    paddingTop: 16,
    gap: 8,
  },
  infoSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#52525b",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 4,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoStepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#27272a",
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
    flexShrink: 0,
  },
  infoStepText: {
    flex: 1,
    fontSize: 13,
    color: "#71717a",
    lineHeight: 19,
  },
  infoLink: {
    color: "#067d35",
  },
  infoCode: {
    fontSize: 11,
    color: "#a1a1aa",
    backgroundColor: "#1c1c1e",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: "monospace",
    marginLeft: 30,
  },
});

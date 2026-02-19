import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useTheme } from "@/lib/useTheme";
import { DB_PATH, DB_URL, needsSetupRef } from "./_layout";

const APP_VERSION = Constants.expoConfig?.version ?? "—";

export default function SettingsScreen() {
  const { colors } = useTheme();

  async function handleBack() {
    try {
      const info = await FileSystem.getInfoAsync(DB_PATH);
      if (!info.exists) {
        needsSetupRef.current();
        return;
      }
    } catch {
      needsSetupRef.current();
      return;
    }
    router.back();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Database ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DATABASE</Text>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Dictionary database</Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            The ~242 MB SQLite database is stored in the app's internal storage. Press the
            download button on the setup screen to fetch it — there is no automatic download.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Storage path</Text>
          <Text
            style={[styles.monoText, { color: colors.text, backgroundColor: colors.bgSubtle }]}
            selectable
          >
            {DB_PATH}
          </Text>

          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Download source</Text>
          <Text
            style={[styles.monoText, { color: colors.text, backgroundColor: colors.bgSubtle }]}
            selectable
          >
            {DB_URL}
          </Text>
        </View>

        {/* ── How to remove the database ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 16 }]}>
          HOW TO REMOVE THE DATABASE
        </Text>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.removeRow}>
            <View style={[styles.removeIcon, { backgroundColor: colors.bgSubtle }]}>
              <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.removeTextCol}>
              <Text style={[styles.removeTitle, { color: colors.text }]}>Clear app data</Text>
              <Text style={[styles.removeBody, { color: colors.textSecondary }]}>
                Go to <Text style={[styles.bold, { color: colors.text }]}>Settings → Apps → Learn Circassian → Clear Data</Text>.
                {" "}This removes the database and all app data. On next launch the app will show the download screen again.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.removeRow}>
            <View style={[styles.removeIcon, { backgroundColor: colors.bgSubtle }]}>
              <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.removeTextCol}>
              <Text style={[styles.removeTitle, { color: colors.text }]}>Uninstall the app</Text>
              <Text style={[styles.removeBody, { color: colors.textSecondary }]}>
                Android deletes all internal app data on uninstall, including the database.
                Reinstalling starts fresh with the download screen.
              </Text>
            </View>
          </View>
        </View>

        {/* ── About ── */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 16 }]}>ABOUT</Text>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>{APP_VERSION}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Platform</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>Android</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 80,
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 80,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },

  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  monoText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "monospace",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },

  removeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  removeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  removeTextCol: {
    flex: 1,
    gap: 4,
  },
  removeTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  removeBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  bold: {
    fontWeight: "600",
  },

  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

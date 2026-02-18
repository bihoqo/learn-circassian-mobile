import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWordLookup } from "@/features/dictionary/hooks/useWordLookup";
import { useDictionaryStore } from "@/features/dictionary/store/useDictionaryStore";
import { toPalochka } from "@/features/dictionary/consts";
import { useTheme } from "@/lib/useTheme";
import { LanguageFilter } from "@/features/dictionary/components/LanguageFilter";
import { WordEntryCard } from "@/features/dictionary/components/WordEntryCard";

function langMatches(code: string, filter: string): boolean {
  if (code === "Ady/Kbd") return filter === "Ady" || filter === "Kbd";
  return code === filter;
}

export default function WordScreen() {
  const { word } = useLocalSearchParams<{ word: string }>();
  const router = useRouter();
  const { data, isLoading, notFound } = useWordLookup(word ?? "");
  const { fromLangFilter, setFromLangFilter, toLangFilter, setToLangFilter } =
    useDictionaryStore();
  const { colors } = useTheme();

  const displayWord = toPalochka(word ?? "");

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: displayWord }} />
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
          <View style={styles.centered}>
            <ActivityIndicator color="#067d35" size="large" />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (notFound || !data) {
    return (
      <>
        <Stack.Screen options={{ title: "Not Found" }} />
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
          <View style={styles.centered}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.notFoundTitle, { color: colors.text }]}>
              Word not found
            </Text>
            <Text style={[styles.notFoundSub, { color: colors.textMuted }]}>
              No entries found for "{displayWord}"
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={16} color="#fff" />
              <Text style={styles.backBtnText}>Back to search</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const entries = data.entries;

  const matchesFilter = (entry: (typeof entries)[number]) => {
    if (fromLangFilter && !langMatches(entry.dictionary.from_lang, fromLangFilter))
      return false;
    if (toLangFilter && !langMatches(entry.dictionary.to_lang, toLangFilter))
      return false;
    return true;
  };

  const hasActiveFilter = fromLangFilter !== null || toLangFilter !== null;
  const activeEntries = hasActiveFilter ? entries.filter(matchesFilter) : entries;
  const disabledEntries = hasActiveFilter
    ? entries.filter((e) => !matchesFilter(e))
    : [];

  return (
    <>
      <Stack.Screen options={{ title: displayWord }} />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.wordTitle, { color: colors.text }]}>
            {displayWord}
          </Text>
          <Text style={[styles.entryCount, { color: colors.textMuted }]}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </Text>

          <LanguageFilter
            entries={entries}
            fromLang={fromLangFilter}
            toLang={toLangFilter}
            onFromLangChange={setFromLangFilter}
            onToLangChange={setToLangFilter}
          />

          {activeEntries.map((entry) => (
            <WordEntryCard
              key={`active-${entry.id}`}
              entry={entry}
              isDisabled={false}
              defaultExpanded={activeEntries.length <= 3}
            />
          ))}

          {disabledEntries.length > 0 && (
            <>
              <Text style={[styles.filteredLabel, { color: colors.textMuted }]}>
                {disabledEntries.length} filtered{" "}
                {disabledEntries.length === 1 ? "entry" : "entries"}
              </Text>
              {disabledEntries.map((entry) => (
                <WordEntryCard
                  key={`disabled-${entry.id}`}
                  entry={entry}
                  isDisabled
                />
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 10, paddingTop: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  wordTitle: { fontSize: 34, fontWeight: "800", letterSpacing: -0.5, marginBottom: 4 },
  entryCount: { fontSize: 13, marginBottom: 20 },
  filteredLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 8,
  },
  notFoundTitle: { fontSize: 22, fontWeight: "700" },
  notFoundSub: { fontSize: 15, textAlign: "center" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#067d35",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  backBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});

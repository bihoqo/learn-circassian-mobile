import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDictionarySearch } from "@/features/dictionary/hooks/useDictionarySearch";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { useTheme } from "@/lib/useTheme";
import { SearchInput } from "@/features/dictionary/components/SearchInput";
import { SearchResultsList } from "@/features/dictionary/components/SearchResultsList";

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);
  const {
    query,
    setQuery,
    clearQuery,
    results,
    isLoading,
    hasMore,
    loadMore,
    isContainsTooShort,
  } = useDictionarySearch();
  const { toggleTheme } = useThemeStore();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Ionicons name="book" size={18} color="#fff" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Circassian Dictionary
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => router.push("/settings" as Href)}
              style={[styles.iconBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            >
              <Ionicons name="settings-outline" size={17} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.iconBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={17}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search input */}
        <View style={styles.section}>
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={clearQuery}
            inputRef={inputRef}
          />
        </View>

        {/* Results */}
        <View style={styles.flex}>
          <SearchResultsList
            results={results}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            query={query}
            isContainsTooShort={isContainsTooShort}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#067d35",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { paddingHorizontal: 16, paddingBottom: 8 },
});

import React from "react";
import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import { toPalochka, MIN_CONTAINS_CHARS } from "../consts";

interface SearchResultsListProps {
  results: string[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  query: string;
  isContainsTooShort: boolean;
}

export function SearchResultsList({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  query,
  isContainsTooShort,
}: SearchResultsListProps) {
  const router = useRouter();
  const { colors } = useTheme();

  if (!query.trim()) return null;

  // "Contains" selected but not enough characters yet
  if (isContainsTooShort) {
    return (
      <View style={styles.centered}>
        <Ionicons name="information-circle-outline" size={32} color={colors.textMuted} />
        <Text style={[styles.infoTitle, { color: colors.text }]}>
          More characters needed
        </Text>
        <Text style={[styles.infoSub, { color: colors.textMuted }]}>
          Because you selected "Contains", you must search with at least{" "}
          <Text style={{ fontWeight: "700", color: colors.green }}>
            {MIN_CONTAINS_CHARS} characters
          </Text>
          .
        </Text>
      </View>
    );
  }

  if (isLoading && results.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#067d35" size="large" />
      </View>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.noResults, { color: colors.textMuted }]}>
          No results for "{toPalochka(query)}"
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(word) => word}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item: word }) => (
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: colors.borderSubtle }]}
          onPress={() =>
            router.push({ pathname: "/word/[word]", params: { word } })
          }
          activeOpacity={0.6}
        >
          <Text style={[styles.wordText, { color: colors.text }]}>
            {toPalochka(word)}
          </Text>
          <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
        </TouchableOpacity>
      )}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isLoading && results.length > 0 ? (
          <View style={styles.footerSpinner}>
            <ActivityIndicator color="#067d35" size="small" />
          </View>
        ) : hasMore ? (
          <TouchableOpacity
            onPress={onLoadMore}
            style={[styles.showMoreBtn, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.showMoreText, { color: colors.green }]}>
              Show more
            </Text>
            <Ionicons name="chevron-down" size={15} color={colors.green} />
          </TouchableOpacity>
        ) : null
      }
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 24, paddingHorizontal: 4 },
  centered: { alignItems: "center", paddingTop: 40, paddingHorizontal: 16, gap: 10 },
  noResults: { fontSize: 15 },
  infoTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  infoSub: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordText: { fontSize: 17, fontWeight: "500" },
  footerSpinner: { paddingVertical: 16, alignItems: "center" },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  showMoreText: { fontSize: 14, fontWeight: "600" },
});

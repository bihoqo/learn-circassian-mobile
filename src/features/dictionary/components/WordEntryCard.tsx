import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import { LANGUAGE_DISPLAY_MAP, toPalochka } from "../consts";
import type { IWordEntryWithDictionary } from "../types";

interface WordEntryCardProps {
  entry: IWordEntryWithDictionary;
  isDisabled: boolean;
  defaultExpanded?: boolean;
}

export function WordEntryCard({
  entry,
  isDisabled,
  defaultExpanded = false,
}: WordEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  const fromName = LANGUAGE_DISPLAY_MAP[entry.dictionary.from_lang] ?? entry.dictionary.from_lang;
  const toName = LANGUAGE_DISPLAY_MAP[entry.dictionary.to_lang] ?? entry.dictionary.to_lang;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        isDisabled && styles.disabled,
      ]}
    >
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text
            style={[styles.dictTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {toPalochka(entry.dictionary.title)}
          </Text>
          <View
            style={[styles.langBadge, { backgroundColor: colors.greenBadgeBg }]}
          >
            <Text style={[styles.langBadgeText, { color: colors.greenBadgeText }]}>
              {fromName} → {toName}
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={17}
          color={colors.textMuted}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          <RenderHtml
            contentWidth={width - 64}
            source={{ html: toPalochka(entry.html) }}
            baseStyle={{ color: colors.text, fontSize: 15, lineHeight: 22 }}
            tagsStyles={{
              b: { color: isDark ? "#f4f4f5" : "#09090b" },
              i: { color: colors.textSecondary },
              font: { color: colors.text },
              p: { marginVertical: 4 },
            }}
            enableExperimentalBRCollapsing
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  disabled: { opacity: 0.4 },
  header: { flexDirection: "row", alignItems: "center", padding: 14 },
  headerContent: { flex: 1, gap: 6 },
  dictTitle: { fontSize: 14, fontWeight: "600" },
  langBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  langBadgeText: { fontSize: 11, fontWeight: "600" },
  chevron: { marginLeft: 8 },
  body: { borderTopWidth: StyleSheet.hairlineWidth, padding: 14 },
});

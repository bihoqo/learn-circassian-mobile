import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { LANGUAGE_DISPLAY_MAP } from "../consts";
import type { IWordEntryWithDictionary } from "../types";

interface LanguageFilterProps {
  entries: IWordEntryWithDictionary[];
  fromLang: string | null;
  toLang: string | null;
  onFromLangChange: (lang: string | null) => void;
  onToLangChange: (lang: string | null) => void;
}

function buildLangOptions(codes: string[]): { value: string; label: string }[] {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const code of codes) {
    for (const c of code === "Ady/Kbd" ? ["Ady", "Kbd"] : [code]) {
      if (!seen.has(c)) {
        seen.add(c);
        options.push({ value: c, label: LANGUAGE_DISPLAY_MAP[c] ?? c });
      }
    }
  }
  return options;
}

function ChipRow({
  label,
  options,
  activeValue,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  activeValue: string | null;
  onChange: (v: string | null) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {/* "All" chip */}
          <TouchableOpacity
            onPress={() => onChange(null)}
            style={[
              styles.chip,
              activeValue === null
                ? { backgroundColor: colors.green, borderColor: colors.green }
                : { backgroundColor: colors.bgCard, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: activeValue === null ? "#fff" : colors.textSecondary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {options.map((opt) => {
            const isActive = activeValue === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onChange(isActive ? null : opt.value)}
                style={[
                  styles.chip,
                  isActive
                    ? { backgroundColor: colors.green, borderColor: colors.green }
                    : { backgroundColor: colors.bgCard, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? "#fff" : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export function LanguageFilter({
  entries,
  fromLang,
  toLang,
  onFromLangChange,
  onToLangChange,
}: LanguageFilterProps) {
  const fromCodes = [...new Set(entries.map((e) => e.dictionary.from_lang))];
  const toCodes = [...new Set(entries.map((e) => e.dictionary.to_lang))];
  const fromOptions = buildLangOptions(fromCodes);
  const toOptions = buildLangOptions(toCodes);

  if (fromOptions.length <= 1 && toOptions.length <= 1) return null;

  return (
    <View style={styles.container}>
      {fromOptions.length > 1 && (
        <ChipRow
          label="From"
          options={fromOptions}
          activeValue={fromLang}
          onChange={onFromLangChange}
        />
      )}
      {toOptions.length > 1 && (
        <ChipRow
          label="To"
          options={toOptions}
          activeValue={toLang}
          onChange={onToLangChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 16 },
  group: { gap: 8 },
  groupLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  chips: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "500" },
});

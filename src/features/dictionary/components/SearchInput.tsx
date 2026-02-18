import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import { useDictionaryStore } from "../store/useDictionaryStore";
import { MIN_CONTAINS_CHARS } from "../consts";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef: React.RefObject<TextInput | null>;
}

export function SearchInput({ value, onChange, onClear, inputRef }: SearchInputProps) {
  const { searchMode, setSearchMode } = useDictionaryStore();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Text field */}
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.bgInput, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          placeholder="Search words…"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search mode chips */}
      <View style={styles.modeRow}>
        {(["starts_with", "contains"] as const).map((mode) => {
          const isActive = searchMode === mode;
          const label =
            mode === "starts_with"
              ? "Starts with"
              : `Contains (${MIN_CONTAINS_CHARS}+ chars)`;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => setSearchMode(mode)}
              style={[
                styles.modeChip,
                isActive
                  ? { backgroundColor: colors.green, borderColor: colors.green }
                  : { backgroundColor: colors.bgCard, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  { color: isActive ? "#fff" : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  modeRow: { flexDirection: "row", gap: 8 },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeText: { fontSize: 12, fontWeight: "600" },
});

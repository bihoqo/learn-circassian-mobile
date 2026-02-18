import { useColorScheme } from "react-native";
import { useThemeStore } from "@/shared/store/useThemeStore";

const COLORS = {
  dark: {
    bg: "#0f0f0f",
    bgCard: "#1c1c1e",
    bgInput: "#1c1c1e",
    bgSubtle: "#111111",
    border: "#2d2d2d",
    borderSubtle: "#222222",
    text: "#f4f4f5",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    green: "#067d35",
    greenBadgeBg: "rgba(6,125,53,0.2)",
    greenBadgeText: "#4ade80",
    keyBg: "#2a2a2a",
  },
  light: {
    bg: "#f4f4f5",
    bgCard: "#ffffff",
    bgInput: "#ffffff",
    bgSubtle: "#ebebeb",
    border: "#e4e4e7",
    borderSubtle: "#d4d4d8",
    text: "#09090b",
    textSecondary: "#52525b",
    textMuted: "#71717a",
    green: "#067d35",
    greenBadgeBg: "#dcfce7",
    greenBadgeText: "#15803d",
    keyBg: "#e4e4e7",
  },
} as const;

export type AppColors = (typeof COLORS)["dark"];

export function useTheme(): { colors: AppColors; isDark: boolean } {
  const { theme } = useThemeStore();
  const systemScheme = useColorScheme();
  const active = theme === "system" ? (systemScheme ?? "dark") : theme;
  return { colors: COLORS[active], isDark: active === "dark" };
}

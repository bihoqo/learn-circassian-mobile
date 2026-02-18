import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ColorSchemeValue = "light" | "dark" | "system";

interface ThemeState {
  theme: ColorSchemeValue;
  setTheme: (theme: ColorSchemeValue) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "theme-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

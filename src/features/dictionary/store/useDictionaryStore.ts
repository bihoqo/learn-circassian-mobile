import { create } from "zustand";

interface DictionaryState {
  fromLangFilter: string | null;
  setFromLangFilter: (lang: string | null) => void;
  toLangFilter: string | null;
  setToLangFilter: (lang: string | null) => void;
  searchMode: "starts_with" | "contains";
  setSearchMode: (mode: "starts_with" | "contains") => void;
}

export const useDictionaryStore = create<DictionaryState>((set) => ({
  fromLangFilter: null,
  setFromLangFilter: (lang) => set({ fromLangFilter: lang }),
  toLangFilter: null,
  setToLangFilter: (lang) => set({ toLangFilter: lang }),
  searchMode: "starts_with",
  setSearchMode: (mode) => set({ searchMode: mode }),
}));

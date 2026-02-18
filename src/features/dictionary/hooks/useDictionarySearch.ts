import { useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useDebounce } from "use-debounce";
import { searchWordsStartingWith, searchWordsContaining } from "@/db/queries";
import { useDictionaryStore } from "../store/useDictionaryStore";
import { MIN_CONTAINS_CHARS } from "../consts";
import { normalizeQuery } from "@/lib/utils";

const PAGE_SIZE = 50;

export function useDictionarySearch() {
  const db = useSQLiteContext();
  const { searchMode } = useDictionaryStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const normalizedQuery = normalizeQuery(debouncedQuery);

  const isContainsTooShort =
    searchMode === "contains" && normalizedQuery.length > 0 && normalizedQuery.length < MIN_CONTAINS_CHARS;

  const { data, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["dictionary", "search", normalizedQuery, searchMode],
    queryFn: ({ pageParam }) => {
      const page = pageParam as number;
      if (searchMode === "contains") {
        return searchWordsContaining(db, normalizedQuery, page, PAGE_SIZE);
      }
      return searchWordsStartingWith(db, normalizedQuery, page, PAGE_SIZE);
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: normalizedQuery.length > 0 && !isContainsTooShort,
  });

  const results = data?.pages.flatMap((page) => page.data) ?? [];
  const isPending = query !== debouncedQuery;

  const clearQuery = useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    clearQuery,
    results,
    isLoading: isFetching || isPending,
    hasMore: hasNextPage ?? false,
    loadMore: fetchNextPage,
    isContainsTooShort,
  };
}

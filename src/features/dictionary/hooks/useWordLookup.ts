import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { getWordWithDictionaries } from "@/db/queries";

export function useWordLookup(word: string) {
  const db = useSQLiteContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dictionary", "word", word],
    queryFn: () => getWordWithDictionaries(db, word),
    enabled: word.length > 0,
  });

  return {
    data: data ?? null,
    isLoading,
    notFound: isError || (!isLoading && data === null),
  };
}

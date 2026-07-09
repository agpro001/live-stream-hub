import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* ignore */
        }
        return v;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export function useFavorites() {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>(
    "streamhub:favorites",
    [],
  );
  const has = (key: string) => ids.includes(key);
  const toggle = (key: string) =>
    setIds((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [key, ...prev],
    );
  return { ids, has, toggle, hydrated };
}

export function useRecent() {
  const [ids, setIds, hydrated] = useLocalStorage<string[]>(
    "streamhub:recent",
    [],
  );
  const push = (key: string) =>
    setIds((prev) => [key, ...prev.filter((k) => k !== key)].slice(0, 24));
  return { ids, push, hydrated };
}
import type { EventRecord, NewsPostRecord } from "./supabaseApi";

export type ListCacheEntry<T> = {
  data: T;
  updatedAt: number;
};

export type ListDataCache<T> = {
  get: () => ListCacheEntry<T> | null;
  set: (data: T) => ListCacheEntry<T>;
  clear: () => void;
};

export function createListDataCache<T>(): ListDataCache<T> {
  let entry: ListCacheEntry<T> | null = null;

  return {
    get: () => entry,
    set: (data: T) => {
      entry = {
        data,
        updatedAt: Date.now(),
      };
      return entry;
    },
    clear: () => {
      entry = null;
    },
  };
}

export const eventsListDataCache = createListDataCache<EventRecord[]>();
export const newsListDataCache = createListDataCache<NewsPostRecord[]>();

import { beforeEach, describe, expect, it } from "vitest";
import {
  createListDataCache,
  eventsListDataCache,
  newsListDataCache,
} from "../listDataCache";

describe("listDataCache", () => {
  beforeEach(() => {
    eventsListDataCache.clear();
    newsListDataCache.clear();
  });

  it("starts empty and stores values with timestamp", () => {
    const cache = createListDataCache<string[]>();

    expect(cache.get()).toBeNull();

    const before = Date.now();
    cache.set(["a", "b"]);
    const entry = cache.get();

    expect(entry).not.toBeNull();
    expect(entry?.data).toEqual(["a", "b"]);
    expect(typeof entry?.updatedAt).toBe("number");
    expect((entry?.updatedAt ?? 0) >= before).toBe(true);
  });

  it("can clear cached data", () => {
    const cache = createListDataCache<number[]>();
    cache.set([1, 2, 3]);

    expect(cache.get()?.data).toEqual([1, 2, 3]);

    cache.clear();
    expect(cache.get()).toBeNull();
  });

  it("supports empty list as valid cached data", () => {
    eventsListDataCache.set([]);
    newsListDataCache.set([]);

    expect(eventsListDataCache.get()).toEqual(
      expect.objectContaining({ data: [] })
    );
    expect(newsListDataCache.get()).toEqual(
      expect.objectContaining({ data: [] })
    );
  });
});

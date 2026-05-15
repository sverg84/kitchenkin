import type { KeyValueCache } from "@apollo/utils.keyvaluecache";

/**
 * In-process cache for Apollo Server. Avoids default InMemoryLRUCache, which
 * requires lru-cache's Node entry that Vercel's Bun/Hono tracer does not ship.
 */
export class SimpleMapCache<V = string> implements KeyValueCache<V> {
  private readonly map = new Map<string, V>();

  async get(key: string): Promise<V | undefined> {
    return this.map.get(key);
  }

  async set(key: string, value: V): Promise<void> {
    this.map.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.map.delete(key);
  }
}

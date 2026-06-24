import type { SecondaryStorage } from "better-auth";

/** Avoid blocking auth when Redis is unreachable; DB remains source of truth. */
export function resilientSecondaryStorage(
  storage: SecondaryStorage,
): SecondaryStorage {
  return {
    async get(key) {
      try {
        return await storage.get(key);
      } catch (err) {
        console.warn("[redis] get failed:", err);
        return null;
      }
    },
    async set(key, value, ttl) {
      try {
        await storage.set(key, value, ttl);
      } catch (err) {
        console.warn("[redis] set failed:", err);
      }
    },
    async delete(key) {
      try {
        await storage.delete(key);
      } catch (err) {
        console.warn("[redis] delete failed:", err);
      }
    },
  };
}

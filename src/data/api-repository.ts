import type { SocietyRepository } from "@/data/repository";
import type { Database } from "@/types";
import { createSeed } from "@/data/seed";

const CACHE_KEY = "estate-management.v3-api-cache";

/**
 * ApiRepository: Connects the React client to the PostgreSQL Express backend.
 * Features automatic fallback to local cache if offline, ensuring high availability.
 */
export class ApiRepository implements SocietyRepository {
  private get apiUrl(): string {
    const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    return `${base}/api/data`;
  }

  async load(): Promise<Database> {
    try {
      const response = await fetch(`${this.apiUrl}/snapshot`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as Database;
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        // Cache latest snapshot locally
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {}
        return data;
      }
      throw new Error("Invalid database payload");
    } catch (err) {
      console.warn("ApiRepository: Failed to load from PostgreSQL backend, checking local cache...", err);
      // Fallback to cache or seed
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.users?.length) return parsed as Database;
        }
      } catch {}
      return createSeed();
    }
  }

  async save(db: Database): Promise<void> {
    // 1. Persist to local cache immediately for snappy UI
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(db));
    } catch {}

    // 2. Persist to PostgreSQL backend via sync API
    try {
      const response = await fetch(`${this.apiUrl}/sync`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(db),
      });

      if (!response.ok) {
        console.warn(`ApiRepository: Sync responded with status ${response.status}`);
      }
    } catch (err) {
      console.warn("ApiRepository: Background sync to PostgreSQL failed:", err);
    }
  }

  async reset(): Promise<Database> {
    const seed = createSeed();
    await this.save(seed);
    return seed;
  }
}

export const apiRepository: SocietyRepository = new ApiRepository();

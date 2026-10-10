import { createSeed } from "@/data/seed";
import type { SocietyRepository } from "@/data/repository";
import type { Database } from "@/types";

const STORAGE_KEY = "estate-management.v3-single-society-pure";

/**
 * Browser stand-in for the future API.
 * Replace this file's export with an ApiRepository when PostgreSQL is ready.
 */
export class LocalRepository implements SocietyRepository {
  async load(): Promise<Database> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.reset();
      const parsed = JSON.parse(raw) as Partial<Database>;
      if (
        !Array.isArray(parsed.demoRequests) ||
        !Array.isArray(parsed.helpers) ||
        !Array.isArray(parsed.familyMembers) ||
        (parsed.societies?.length ?? 0) < 1 ||
        parsed.societies?.some((s) => s.id === "soc-aura" || s.id === "soc-greenmeadows")
      ) {
        return this.reset();
      }
      return parsed as Database;
    } catch {
      return this.reset();
    }
  }

  async save(db: Database): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  async reset(): Promise<Database> {
    const seed = createSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

import { apiRepository } from "@/data/api-repository";

export const repository: SocietyRepository = apiRepository;

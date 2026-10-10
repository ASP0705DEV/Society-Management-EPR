import type { Database } from "@/types";

/**
 * The only door to stored data.
 *
 * Screens call this. They do not know if the data lives in localStorage
 * or, later, in PostgreSQL. Every method is async so a future HTTP
 * repository can drop in without changing the pages.
 */
export interface SocietyRepository {
  load(): Promise<Database>;
  save(db: Database): Promise<void>;
  reset(): Promise<Database>;
}

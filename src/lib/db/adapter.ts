import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * Prisma driver adapter for MySQL / MariaDB (Hostinger, local MariaDB).
 * DATABASE_URL uses the `mysql://` scheme that the Prisma CLI expects; the mariadb driver wants `mariadb://`.
 */
export function mariadbUrl(databaseUrl: string): string {
  return databaseUrl.replace(/^mysql:\/\//i, "mariadb://");
}

export function createAdapter(databaseUrl: string | undefined, connectionLimit?: number): PrismaMariaDb {
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  let url: URL;
  try {
    url = new URL(mariadbUrl(databaseUrl));
  } catch {
    // Node's ERR_INVALID_URL carries the full input (password included) — keep it out of logs.
    throw new Error("DATABASE_URL is not a valid URL (special characters in the password must be URL-encoded)");
  }
  if (connectionLimit && !url.searchParams.has("connectionLimit")) url.searchParams.set("connectionLimit", String(connectionLimit));
  return new PrismaMariaDb(url.toString());
}

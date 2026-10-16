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
  const url = new URL(mariadbUrl(databaseUrl));
  if (connectionLimit && !url.searchParams.has("connectionLimit")) url.searchParams.set("connectionLimit", String(connectionLimit));
  return new PrismaMariaDb(url.toString());
}

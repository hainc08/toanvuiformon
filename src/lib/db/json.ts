/** Reads a JSON column that stores a string[] (MySQL has no native array type). */
export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

import bcrypt from "bcryptjs";

const COST = 12;
export const MIN_PASSWORD_LENGTH = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Pre-computed hash used to keep timing similar when the user does not exist.
const DUMMY_HASH = "$2b$12$TyY1/e6Eg5/9kJZKK756WO0FhiEduHgpHALB62LOJPrdWPcO2ZtGG";
export async function verifyPasswordConstantTime(plain: string, hash: string | null): Promise<boolean> {
  const ok = await bcrypt.compare(plain, hash ?? DUMMY_HASH);
  return hash !== null && ok;
}

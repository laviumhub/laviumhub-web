import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

function looksLikeBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_COST);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  if (!passwordHash || !looksLikeBcryptHash(passwordHash)) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

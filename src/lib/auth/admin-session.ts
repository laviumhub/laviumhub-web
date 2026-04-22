export const ADMIN_SESSION_COOKIE = "lh_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

export type AdminSessionPayload = {
  uid: string;
  username: string;
  name: string;
  exp: number;
};

type AdminSessionData = Omit<AdminSessionPayload, "exp">;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function getAdminSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? null;
}

async function importSecretKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signAdminSession(data: AdminSessionData): Promise<string> {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error("Missing required environment variable: ADMIN_SESSION_SECRET");
  }

  const payload: AdminSessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS
  };

  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importSecretKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));

  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(token: string | undefined): Promise<AdminSessionPayload | null> {
  if (!token) return null;

  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  try {
    const key = await importSecretKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(fromBase64Url(signaturePart)),
      new TextEncoder().encode(payloadPart)
    );

    if (!isValid) return null;

    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart))) as AdminSessionPayload;
    if (!parsed?.uid || !parsed?.username || !parsed?.name || !parsed?.exp) return null;
    if (parsed.exp <= Math.floor(Date.now() / 1000)) return null;

    return parsed;
  } catch {
    return null;
  }
}

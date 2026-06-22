import { createHmac, timingSafeEqual } from "node:crypto";

type TokenKind = "download" | "unsubscribe";

type TokenPayload = {
  email: string;
  exp: number;
};

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(kind: TokenKind, payload: string, secret: string) {
  return createHmac("sha256", secret).update(`${kind}:${payload}`).digest("base64url");
}

function createToken(kind: TokenKind, email: string, secret: string, issuedAt: number, ttlSeconds: number) {
  const payload = encode(JSON.stringify({ email: email.trim().toLowerCase(), exp: issuedAt + ttlSeconds }));
  return `${payload}.${sign(kind, payload, secret)}`;
}

function verifyToken(kind: TokenKind, token: string, secret: string, now: number) {
  try {
    const [payload, receivedSignature, extra] = token.split(".");
    if (!payload || !receivedSignature || extra) return null;

    const expectedSignature = sign(kind, payload, secret);
    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(receivedSignature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number" || parsed.exp < now) return null;
    return parsed.email;
  } catch {
    return null;
  }
}

export function createDownloadToken(email: string, secret: string, issuedAt = Math.floor(Date.now() / 1000)) {
  return createToken("download", email, secret, issuedAt, 24 * 60 * 60);
}

export function verifyDownloadToken(token: string, secret: string, now = Math.floor(Date.now() / 1000)) {
  return verifyToken("download", token, secret, now);
}

export function createUnsubscribeToken(email: string, secret: string, issuedAt = Math.floor(Date.now() / 1000)) {
  return createToken("unsubscribe", email, secret, issuedAt, 30 * 24 * 60 * 60);
}

export function verifyUnsubscribeToken(token: string, secret: string, now = Math.floor(Date.now() / 1000)) {
  return verifyToken("unsubscribe", token, secret, now);
}

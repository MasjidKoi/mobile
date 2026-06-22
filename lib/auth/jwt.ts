import { jwtDecode } from "jwt-decode";

/**
 * Consumer JWT claims (GoTrue HS256). The consumer app's role is `app_user`;
 * the shape is intentionally loose because we only read identity + expiry here.
 */
export type AppJwtPayload = {
  sub: string;
  email?: string;
  app_metadata?: {
    provider?: string;
    role?: string;
    masjid_id?: string | null;
  };
  exp: number;
  iat: number;
};

export type DecodedUser = {
  userId: string;
  email: string | null;
  role: string | null;
};

export function decodeToken(token: string): AppJwtPayload {
  return jwtDecode<AppJwtPayload>(token);
}

export function toDecodedUser(token: string): DecodedUser {
  const payload = decodeToken(token);
  return {
    userId: payload.sub,
    email: payload.email ?? null,
    role: payload.app_metadata?.role ?? null,
  };
}

/**
 * True when the token is expired (or unparseable). A small clock skew makes us
 * refresh slightly early rather than fire a request that's about to 401.
 */
export function isExpired(token: string, skewSeconds = 30): boolean {
  try {
    const { exp } = decodeToken(token);
    return Date.now() >= (exp - skewSeconds) * 1000;
  } catch {
    return true;
  }
}

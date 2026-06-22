/**
 * SSLCommerz hosted-checkout hand-off. We open the gateway URL in a secure
 * system in-app browser (`openAuthSessionAsync`); when the backend finishes it
 * redirects to `masjidkoi://donation/{id}?status=success|fail|cancel`, which the
 * auth session intercepts (matching the `masjidkoi://donation` prefix) and
 * returns to us in-process — no cold deep-link round-trip on the happy path.
 */
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

/** `dismiss` = the user closed the browser before the gateway redirected. */
export type CheckoutOutcome = "success" | "fail" | "cancel" | "dismiss";

export interface CheckoutResult {
  outcome: CheckoutOutcome;
  /** The donation id from the return URL, if one was present. */
  donationId?: string;
}

/** Prefix the auth session watches for; also the cold deep-link route. */
const RETURN_PREFIX = "masjidkoi://donation";

/** Parse `masjidkoi://donation/{id}?status=...` into an outcome + id. */
export function parseReturnUrl(url: string): CheckoutResult {
  const parsed = Linking.parse(url);
  // Custom-scheme URLs put the first segment in `hostname` ("donation") and the
  // id in `path`; normalize both into one segment list and take the last.
  const segments = [parsed.hostname, ...(parsed.path ?? "").split("/")].filter(
    (s): s is string => Boolean(s),
  );
  const donationId = segments[segments.length - 1];

  const status = String(parsed.queryParams?.status ?? "");
  const outcome: CheckoutOutcome =
    status === "success" ? "success" : status === "cancel" ? "cancel" : "fail";

  return { outcome, donationId };
}

export async function openCheckout(gatewayUrl: string): Promise<CheckoutResult> {
  const result = await WebBrowser.openAuthSessionAsync(gatewayUrl, RETURN_PREFIX);
  if (result.type === "success" && result.url) {
    return parseReturnUrl(result.url);
  }
  // "cancel" / "dismiss" / "locked": the donation stays `pending` server-side —
  // the status screen can still poll/recover it.
  return { outcome: "dismiss" };
}

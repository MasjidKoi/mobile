/**
 * ContactLinks — pure construction of openable URIs from a masjid's `contact`
 * record: `tel:`, `mailto:`, a WhatsApp `wa.me` chat, and the website. Each
 * present channel becomes a row; absent or malformed channels produce no row
 * (fail-closed — never a dead tap). Dependency-free, so it is unit-tested in
 * isolation; the component maps `key` → icon + label and calls `Linking`.
 */
import type { ContactResponse } from "../types";

export type ContactChannel = "phone" | "whatsapp" | "email" | "website";

export interface ContactLink {
  key: ContactChannel;
  /** Human-readable value for the row (the number, address, or bare host). */
  display: string;
  /** URI handed to `Linking.openURL`. */
  uri: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Build the ordered list of openable contact rows. Order is phone → WhatsApp →
 * email → website (the design's contact-card order).
 */
export function buildContactLinks(contact: ContactResponse | null | undefined): ContactLink[] {
  if (!contact) return [];
  const links: ContactLink[] = [];

  // Phone — keep digits and a leading "+"; need at least a few digits to dial.
  const phone = contact.phone?.trim();
  if (phone) {
    const tel = phone.replace(/[^\d+]/g, "");
    if (digitsOnly(tel).length >= 4) {
      links.push({ key: "phone", display: phone, uri: `tel:${tel}` });
    }
  }

  // WhatsApp — wa.me wants bare international digits (no "+", spaces, dashes).
  const whatsapp = contact.whatsapp?.trim();
  if (whatsapp) {
    const d = digitsOnly(whatsapp);
    if (d.length >= 6) {
      links.push({ key: "whatsapp", display: whatsapp, uri: `https://wa.me/${d}` });
    }
  }

  // Email — only if it looks like an address.
  const email = contact.email?.trim();
  if (email && EMAIL_RE.test(email)) {
    links.push({ key: "email", display: email, uri: `mailto:${email}` });
  }

  // Website — ensure a scheme for the URI; show the bare host/path for display.
  const website = contact.website_url?.trim();
  if (website) {
    const uri = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    const display = website.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    if (display) {
      links.push({ key: "website", display, uri });
    }
  }

  return links;
}

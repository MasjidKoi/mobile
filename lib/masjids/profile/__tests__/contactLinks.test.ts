import type { ContactResponse } from "../../types";
import { buildContactLinks } from "../contactLinks";

function contact(overrides: Partial<ContactResponse> = {}): ContactResponse {
  return {
    phone: null,
    email: null,
    whatsapp: null,
    website_url: null,
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildContactLinks", () => {
  it("returns nothing when there is no contact record", () => {
    expect(buildContactLinks(null)).toEqual([]);
  });

  it("returns nothing when every channel is empty", () => {
    expect(buildContactLinks(contact())).toEqual([]);
  });

  describe("phone", () => {
    it("builds a tel: URI, preserving a leading +", () => {
      const [link] = buildContactLinks(contact({ phone: "+880 1712-345678" }));
      expect(link).toEqual({ key: "phone", display: "+880 1712-345678", uri: "tel:+8801712345678" });
    });

    it("fails closed for a too-short / junk number", () => {
      expect(buildContactLinks(contact({ phone: "  " }))).toEqual([]);
      expect(buildContactLinks(contact({ phone: "n/a" }))).toEqual([]);
    });
  });

  describe("whatsapp", () => {
    it("strips to bare digits for wa.me", () => {
      const [link] = buildContactLinks(contact({ whatsapp: "+880 1712 345 678" }));
      expect(link.uri).toBe("https://wa.me/8801712345678");
      expect(link.display).toBe("+880 1712 345 678");
    });

    it("fails closed when there are too few digits", () => {
      expect(buildContactLinks(contact({ whatsapp: "call us" }))).toEqual([]);
    });
  });

  describe("email", () => {
    it("builds a mailto: URI for a valid address", () => {
      const [link] = buildContactLinks(contact({ email: "imam@masjid.org" }));
      expect(link).toEqual({ key: "email", display: "imam@masjid.org", uri: "mailto:imam@masjid.org" });
    });

    it("fails closed for a malformed address", () => {
      expect(buildContactLinks(contact({ email: "not-an-email" }))).toEqual([]);
      expect(buildContactLinks(contact({ email: "missing@dot" }))).toEqual([]);
    });
  });

  describe("website", () => {
    it("keeps an explicit scheme and shows the bare host for display", () => {
      const [link] = buildContactLinks(contact({ website_url: "https://masjid.org/" }));
      expect(link.uri).toBe("https://masjid.org/");
      expect(link.display).toBe("masjid.org");
    });

    it("prepends https:// when the scheme is missing", () => {
      const [link] = buildContactLinks(contact({ website_url: "masjid.org" }));
      expect(link.uri).toBe("https://masjid.org");
      expect(link.display).toBe("masjid.org");
    });
  });

  it("orders rows phone → whatsapp → email → website", () => {
    const links = buildContactLinks(
      contact({
        website_url: "masjid.org",
        email: "a@b.co",
        whatsapp: "+8801712345678",
        phone: "+8801712345678",
      }),
    );
    expect(links.map((l) => l.key)).toEqual(["phone", "whatsapp", "email", "website"]);
  });
});

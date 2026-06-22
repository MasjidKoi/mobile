import type { FacilitiesResponse } from "../../types";
import { presentMasjidFacilities } from "../facilityPresenter";

/** A facilities record with everything off/empty; override per test. */
function facilities(overrides: Partial<FacilitiesResponse> = {}): FacilitiesResponse {
  return {
    has_sisters_section: false,
    has_wudu_area: false,
    has_wudu_male: false,
    has_wudu_female: false,
    has_wheelchair_access: false,
    has_parking: false,
    parking_capacity: null,
    has_janazah: false,
    has_school: false,
    imam_name: null,
    imam_qualifications: null,
    imam_languages: null,
    capacity_male: null,
    capacity_female: null,
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("presentMasjidFacilities", () => {
  it("collapses every section when there is no facilities record", () => {
    const p = presentMasjidFacilities(null);
    expect(p.chips).toHaveLength(0);
    expect(p.capacityParts).toHaveLength(0);
    expect(p.imam).toBeNull();
    expect(p.hasFacilities).toBe(false);
    expect(p.hasCapacity).toBe(false);
    expect(p.hasImam).toBe(false);
  });

  it("renders all facility chips (present + absent) when a record exists", () => {
    const p = presentMasjidFacilities(facilities());
    expect(p.hasFacilities).toBe(true);
    expect(p.chips).toHaveLength(7);
    expect(p.chips.every((c) => c.present === false)).toBe(true);
  });

  it("marks each flag's chip present when the flag is true", () => {
    const p = presentMasjidFacilities(
      facilities({ has_sisters_section: true, has_parking: true, has_wudu_female: true }),
    );
    const present = (key: string) => p.chips.find((c) => c.key === key)?.present;
    expect(present("has_sisters_section")).toBe(true);
    expect(present("has_parking")).toBe(true);
    expect(present("has_wudu_female")).toBe(true);
    expect(present("has_wudu_male")).toBe(false);
    expect(present("has_school")).toBe(false);
  });

  describe("capacity (every null subset of male/female/parking)", () => {
    it("includes all three when all are set, in male/female/parking order", () => {
      const p = presentMasjidFacilities(
        facilities({ capacity_male: 800, capacity_female: 200, parking_capacity: 30 }),
      );
      expect(p.hasCapacity).toBe(true);
      expect(p.capacityParts.map((c) => c.key)).toEqual(["male", "female", "parking"]);
      expect(p.capacityParts.map((c) => c.value)).toEqual([800, 200, 30]);
    });

    it("keeps only the set figures (male + parking, female null)", () => {
      const p = presentMasjidFacilities(facilities({ capacity_male: 500, parking_capacity: 20 }));
      expect(p.capacityParts.map((c) => c.key)).toEqual(["male", "parking"]);
    });

    it("keeps a single set figure (female only)", () => {
      const p = presentMasjidFacilities(facilities({ capacity_female: 150 }));
      expect(p.capacityParts.map((c) => c.key)).toEqual(["female"]);
      expect(p.hasCapacity).toBe(true);
    });

    it("treats 0 as a real figure, not absent", () => {
      const p = presentMasjidFacilities(facilities({ parking_capacity: 0 }));
      expect(p.capacityParts).toEqual([
        expect.objectContaining({ key: "parking", value: 0 }),
      ]);
    });

    it("has no capacity when all three are null", () => {
      const p = presentMasjidFacilities(facilities());
      expect(p.capacityParts).toHaveLength(0);
      expect(p.hasCapacity).toBe(false);
    });
  });

  describe("imam descriptor", () => {
    it("is present with all fields when name + quals + languages are set", () => {
      const p = presentMasjidFacilities(
        facilities({
          imam_name: "Mufti Abdullah",
          imam_qualifications: "Dawra-e-Hadith",
          imam_languages: "Bangla, Arabic",
        }),
      );
      expect(p.hasImam).toBe(true);
      expect(p.imam).toEqual({
        name: "Mufti Abdullah",
        qualifications: "Dawra-e-Hadith",
        languages: "Bangla, Arabic",
      });
    });

    it("handles a name with partial fields (quals null)", () => {
      const p = presentMasjidFacilities(facilities({ imam_name: "Imam Karim" }));
      expect(p.imam).toEqual({ name: "Imam Karim", qualifications: null, languages: null });
    });

    it("is null when no imam name is set, even if other fields are present", () => {
      const p = presentMasjidFacilities(facilities({ imam_qualifications: "Alim" }));
      expect(p.imam).toBeNull();
      expect(p.hasImam).toBe(false);
    });

    it("treats a whitespace-only name as no imam", () => {
      const p = presentMasjidFacilities(facilities({ imam_name: "   " }));
      expect(p.imam).toBeNull();
    });
  });
});

/**
 * FacilityPresenter — pure transform from a masjid's `facilities` payload to the
 * profile's display model: a present/absent chip list, the capacity figures
 * (any subset of male/female/parking), the imam descriptor, and the section-
 * collapse signals that keep a sparse/unclaimed profile looking intentional.
 *
 * Deliberately dependency-free (no React Native / icon imports) so it is unit-
 * tested in isolation. Number formatting (Bengali numerals) and icon glyph
 * rendering are the component's job — this module returns raw values + glyph
 * *names* (plain strings) only.
 */
import type { FacilitiesResponse } from "../types";

/** A facility chip: shown present (brand fill) or absent (faded) — never hidden. */
export interface FacilityChipModel {
  key: string;
  /** i18n key under `masjid.facility.*`. */
  labelKey: string;
  /** Feather glyph name (a plain string; the component casts it). */
  icon: string;
  present: boolean;
}

/** One capacity figure; the component formats `value` with locale numerals. */
export interface CapacityPart {
  key: "male" | "female" | "parking";
  /** i18n key under `masjid.profile.capacity.*`. */
  labelKey: string;
  value: number;
}

export interface ImamModel {
  name: string;
  qualifications: string | null;
  languages: string | null;
}

export interface FacilityPresentation {
  chips: FacilityChipModel[];
  capacityParts: CapacityPart[];
  imam: ImamModel | null;
  /** Section-collapse signals: a section renders only when its flag is true. */
  hasFacilities: boolean;
  hasCapacity: boolean;
  hasImam: boolean;
}

/** The facility flags shown on the profile, in display order (PRD §Facilities). */
const FACILITY_FIELDS: { field: keyof FacilitiesResponse; labelKey: string; icon: string }[] = [
  { field: "has_sisters_section", labelKey: "masjid.facility.sisters", icon: "users" },
  { field: "has_wudu_male", labelKey: "masjid.facility.wuduMale", icon: "droplet" },
  { field: "has_wudu_female", labelKey: "masjid.facility.wuduFemale", icon: "droplet" },
  { field: "has_wheelchair_access", labelKey: "masjid.facility.wheelchair", icon: "user-check" },
  { field: "has_parking", labelKey: "masjid.facility.parking", icon: "truck" },
  { field: "has_janazah", labelKey: "masjid.facility.janazah", icon: "moon" },
  { field: "has_school", labelKey: "masjid.facility.school", icon: "book-open" },
];

const EMPTY: FacilityPresentation = {
  chips: [],
  capacityParts: [],
  imam: null,
  hasFacilities: false,
  hasCapacity: false,
  hasImam: false,
};

/** A non-empty, non-whitespace string, else null — for imam text fields. */
function cleaned(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function presentMasjidFacilities(
  facilities: FacilitiesResponse | null | undefined,
): FacilityPresentation {
  // Unclaimed / sparse masjid with no facilities record at all → collapse all.
  if (!facilities) return EMPTY;

  const chips: FacilityChipModel[] = FACILITY_FIELDS.map((f) => ({
    key: f.field,
    labelKey: f.labelKey,
    icon: f.icon,
    present: facilities[f.field] === true,
  }));

  const capacityParts: CapacityPart[] = [];
  if (facilities.capacity_male != null)
    capacityParts.push({ key: "male", labelKey: "masjid.profile.capacity.male", value: facilities.capacity_male });
  if (facilities.capacity_female != null)
    capacityParts.push({ key: "female", labelKey: "masjid.profile.capacity.female", value: facilities.capacity_female });
  if (facilities.parking_capacity != null)
    capacityParts.push({ key: "parking", labelKey: "masjid.profile.capacity.parking", value: facilities.parking_capacity });

  const imamName = cleaned(facilities.imam_name);
  const imam: ImamModel | null = imamName
    ? {
        name: imamName,
        qualifications: cleaned(facilities.imam_qualifications),
        languages: cleaned(facilities.imam_languages),
      }
    : null;

  return {
    chips,
    capacityParts,
    imam,
    hasFacilities: true,
    hasCapacity: capacityParts.length > 0,
    hasImam: imam != null,
  };
}

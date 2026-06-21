import { Feather } from "@expo/vector-icons";

import type { MasjidFacilityFilters, MasjidNearbyResult } from "./types";

/** The six facility flags the `nearby` endpoint can filter on (and that map pins/rows surface). */
export type FacilityKey = keyof MasjidFacilityFilters;

/**
 * Single source of truth for facility metadata — drives both the filter sheet
 * (Explore) and the facility icons on list rows / the peek card. `labelKey` is
 * an i18n key; `icon` is a Feather glyph (the kit uses Feather throughout).
 */
export const FACILITIES: {
  key: FacilityKey;
  labelKey: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "has_wudu_area", labelKey: "discovery.facilityNames.has_wudu_area", icon: "droplet" },
  { key: "has_sisters_section", labelKey: "discovery.facilityNames.has_sisters_section", icon: "users" },
  { key: "has_parking", labelKey: "discovery.facilityNames.has_parking", icon: "truck" },
  { key: "has_wheelchair_access", labelKey: "discovery.facilityNames.has_wheelchair_access", icon: "user-check" },
  { key: "has_janazah", labelKey: "discovery.facilityNames.has_janazah", icon: "moon" },
  { key: "has_school", labelKey: "discovery.facilityNames.has_school", icon: "book-open" },
];

/** The subset of `FACILITIES` a given nearby result actually has, for compact icon rows. */
export function presentFacilities(masjid: MasjidNearbyResult) {
  return FACILITIES.filter((f) => masjid[f.key]);
}

import type { DonationCategory, RecurringFrequency } from "./types";

/** Quick-pick amounts (BDT) on the amount screen (35) and recurring setup (46). */
export const AMOUNT_PRESETS = [50, 100, 500, 1000] as const;

/** Donor-selectable categories, in display order. Labels live in i18n. */
export const DONATION_CATEGORIES: readonly DonationCategory[] = [
  "general",
  "building",
  "zakat",
  "sadaqah",
  "lillah",
];

/** Recurring cadences offered in the setup UI (`nightly` is the Last-10 preset). */
export const RECURRING_FREQUENCIES: readonly RecurringFrequency[] = ["weekly", "monthly"];

import { bytesToDisplay, isClearableQuery } from "../cache";

describe("isClearableQuery", () => {
  it("clears only the public persisted reads", () => {
    expect(isClearableQuery(["masjids"])).toBe(true);
    expect(isClearableQuery(["masjids", "detail", "abc"])).toBe(true);
    expect(isClearableQuery(["masjids", "prayer-times", "abc", {}])).toBe(true);
    expect(isClearableQuery(["app-config"])).toBe(true);
    expect(isClearableQuery(["recents", "masjids"])).toBe(true);
  });

  it("never clears settings, auth, or user-scoped data", () => {
    expect(isClearableQuery(["user", "me"])).toBe(false);
    expect(isClearableQuery(["donations", "summary"])).toBe(false);
    expect(isClearableQuery(["reminderPrefs"])).toBe(false);
    expect(isClearableQuery(["notification-preferences"])).toBe(false);
    expect(isClearableQuery(["recurring", "mine"])).toBe(false);
  });
});

describe("bytesToDisplay", () => {
  it("formats megabytes with one decimal above 1 MB", () => {
    expect(bytesToDisplay(2 * 1024 * 1024)).toEqual({ value: 2, unit: "MB" });
    expect(bytesToDisplay(1.55 * 1024 * 1024)).toEqual({ value: 1.6, unit: "MB" });
  });

  it("formats kilobytes below 1 MB", () => {
    expect(bytesToDisplay(4096)).toEqual({ value: 4, unit: "KB" });
    expect(bytesToDisplay(0)).toEqual({ value: 0, unit: "KB" });
  });
});

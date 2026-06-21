import { addDays, currentWeek, dateRange, dhakaToday, isFinalized, parseIso } from "../dates";

describe("dhakaToday", () => {
  it("rolls into the next day once UTC crosses 18:00 (midnight Dhaka, +6)", () => {
    // 2026-06-22T20:00Z → 2026-06-23 02:00 Dhaka.
    expect(dhakaToday(new Date("2026-06-22T20:00:00Z"))).toBe("2026-06-23");
    // 2026-06-22T08:00Z → 2026-06-22 14:00 Dhaka.
    expect(dhakaToday(new Date("2026-06-22T08:00:00Z"))).toBe("2026-06-22");
  });
});

describe("addDays / dateRange", () => {
  it("adds days across a month boundary", () => {
    expect(addDays("2026-06-30", 1)).toBe("2026-07-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("builds an inclusive ascending range", () => {
    expect(dateRange("2026-06-20", "2026-06-22")).toEqual(["2026-06-20", "2026-06-21", "2026-06-22"]);
  });
});

describe("isFinalized", () => {
  const now = new Date("2026-06-22T08:00:00Z"); // 14:00 Dhaka on 2026-06-22

  it("never finalizes today or the future", () => {
    expect(isFinalized("2026-06-22", now)).toBe(false);
    expect(isFinalized("2026-06-23", now)).toBe(false);
  });
  it("finalizes yesterday only after noon Dhaka", () => {
    expect(isFinalized("2026-06-21", now)).toBe(true); // 14:00 ≥ 12:00
    const morning = new Date("2026-06-22T04:00:00Z"); // 10:00 Dhaka
    expect(isFinalized("2026-06-21", morning)).toBe(false);
  });
  it("finalizes anything older than yesterday", () => {
    expect(isFinalized("2026-06-20", now)).toBe(true);
  });
});

describe("currentWeek", () => {
  it("returns a Saturday→Friday span containing today", () => {
    const now = new Date("2026-06-24T06:00:00Z"); // 12:00 Dhaka, a Wednesday
    const { start, end } = currentWeek(now);
    expect(parseIso(start).getUTCDay()).toBe(6); // Saturday
    expect(end).toBe(addDays(start, 6));
    const today = dhakaToday(now);
    expect(start <= today && today <= end).toBe(true);
  });
});

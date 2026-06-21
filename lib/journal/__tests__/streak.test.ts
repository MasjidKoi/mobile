import { reachedMilestone } from "../streak";

describe("reachedMilestone", () => {
  it("returns null below the first milestone", () => {
    expect(reachedMilestone(0)).toBeNull();
    expect(reachedMilestone(6)).toBeNull();
  });
  it("returns the highest milestone at or below the streak", () => {
    expect(reachedMilestone(7)).toBe(7);
    expect(reachedMilestone(39)).toBe(7);
    expect(reachedMilestone(40)).toBe(40);
    expect(reachedMilestone(150)).toBe(100);
    expect(reachedMilestone(365)).toBe(365);
    expect(reachedMilestone(500)).toBe(365);
  });
});

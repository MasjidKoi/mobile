import { DONATION_MAX, DONATION_MIN, donationAmountSchema } from "../schemas";

describe("donationAmountSchema", () => {
  it("accepts amounts within the 10–500,000 BDT range", () => {
    expect(donationAmountSchema.safeParse({ amount: 100 }).success).toBe(true);
    expect(donationAmountSchema.safeParse({ amount: DONATION_MIN }).success).toBe(true);
    expect(donationAmountSchema.safeParse({ amount: DONATION_MAX }).success).toBe(true);
  });

  it("rejects below-minimum with the i18n key", () => {
    const result = donationAmountSchema.safeParse({ amount: DONATION_MIN - 1 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe("validation.amount_too_low");
  });

  it("rejects above-maximum with the i18n key", () => {
    const result = donationAmountSchema.safeParse({ amount: DONATION_MAX + 1 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe("validation.amount_too_high");
  });
});

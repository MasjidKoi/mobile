import { parseReturnUrl } from "../checkout";

describe("parseReturnUrl", () => {
  it("extracts the donation id and a success outcome", () => {
    expect(parseReturnUrl("masjidkoi://donation/abc-123?status=success")).toEqual({
      outcome: "success",
      donationId: "abc-123",
    });
  });

  it("maps cancel through", () => {
    expect(parseReturnUrl("masjidkoi://donation/abc-123?status=cancel").outcome).toBe("cancel");
  });

  it("defaults a missing or unknown status to fail (never a false success)", () => {
    expect(parseReturnUrl("masjidkoi://donation/abc-123").outcome).toBe("fail");
    expect(parseReturnUrl("masjidkoi://donation/abc-123?status=weird").outcome).toBe("fail");
  });

  it("still recovers the id regardless of path shape", () => {
    expect(parseReturnUrl("masjidkoi://donation/xyz?status=fail").donationId).toBe("xyz");
  });
});

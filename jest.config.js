/**
 * Jest setup for the mobile app. Phase 5 introduced this for the two committed
 * pure-logic suites (FacilityPresenter, ContactLinks). Scoped to `__tests__`
 * folders; uses the Expo preset so TS/JSX transform matches `babel.config.js`.
 */
module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

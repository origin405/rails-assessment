// jest.config.ts

import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  projects: ["<rootDir>/apps/*"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};

export default config;

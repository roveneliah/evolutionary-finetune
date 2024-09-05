import { jest } from "@jest/globals";
import formatInfoLine from "./formatInfoLine.js";
import chalk from "chalk";

jest.mock("chalk", () => ({
  cyan: jest.fn((text) => `cyan(${text})`),
  bold: jest.fn((text) => `bold(${text})`),
  green: jest.fn((text) => `green(${text})`),
  yellow: jest.fn((text) => `yellow(${text})`),
}));

describe("formatInfoLine", () => {
  test("formats info line with correct label, value, and color", () => {
    const result = formatInfoLine("Total:", 42, "green");
    expect(result).toBe("cyan(│ )bold(Total:)green(   42)cyan(│)");
  });

  test("pads the value to 5 characters", () => {
    const result = formatInfoLine("Count:", 5, "yellow");
    expect(result).toBe("cyan(│ )bold(Count:)yellow(    5)cyan(│)");
  });

  test("uses cyan color for borders", () => {
    formatInfoLine("Test:", 10, "green");
    expect(chalk.cyan).toHaveBeenCalledWith("│ ");
    expect(chalk.cyan).toHaveBeenCalledWith("│");
  });
});

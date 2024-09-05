import { jest } from "@jest/globals";
import createColorGradient from "./createColorGradient.js";
import chalk from "chalk";

jest.mock("chalk", () => ({
  red: jest.fn((text) => `red(${text})`),
  blue: jest.fn((text) => `blue(${text})`),
  green: jest.fn((text) => `green(${text})`),
}));

describe("createColorGradient", () => {
  test("applies colors to each line of text", () => {
    const text = "line1\nline2\nline3";
    const colors = ["red", "blue", "green"];
    const result = createColorGradient(text, colors);
    expect(result).toBe("red(line1)\nblue(line2)\ngreen(line3)");
  });

  test("cycles through colors if there are more lines than colors", () => {
    const text = "line1\nline2\nline3\nline4";
    const colors = ["red", "blue"];
    const result = createColorGradient(text, colors);
    expect(result).toBe("red(line1)\nblue(line2)\nred(line3)\nblue(line4)");
  });

  test("handles single-line text", () => {
    const text = "single line";
    const colors = ["red", "blue", "green"];
    const result = createColorGradient(text, colors);
    expect(result).toBe("red(single line)");
  });
});

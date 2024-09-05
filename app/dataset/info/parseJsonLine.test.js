import { jest } from "@jest/globals";
import parseJsonLine from "./parseJsonLine.js";
import { EntrySchema } from "../../../lib/schema/datasetSchema.js";

jest.mock("../../../lib/schema/datasetSchema.js", () => ({
  EntrySchema: {
    parse: jest.fn(),
  },
}));

console.warn = jest.fn();

describe("parseJsonLine", () => {
  test("parses valid JSON line correctly", () => {
    const validLine = '{"key": "value"}';
    const parsedObject = { key: "value" };
    EntrySchema.parse.mockReturnValue(parsedObject);

    const result = parseJsonLine(validLine);
    expect(result).toEqual(parsedObject);
    expect(EntrySchema.parse).toHaveBeenCalledWith({ key: "value" });
  });

  test("returns null for invalid JSON line", () => {
    const invalidLine = "invalid json";
    EntrySchema.parse.mockImplementation(() => {
      throw new Error("Invalid JSON");
    });

    const result = parseJsonLine(invalidLine);
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  test("logs warning for invalid entries", () => {
    const invalidLine = '{"key": "value"}';
    EntrySchema.parse.mockImplementation(() => {
      throw new Error("Invalid schema");
    });

    parseJsonLine(invalidLine);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Invalid entry:"),
      invalidLine
    );
  });
});

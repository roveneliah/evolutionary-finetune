import { jest } from "@jest/globals";
import parseFileContent from "./parseFileContent.js";
import parseJsonLine from "./parseJsonLine.js";

jest.mock("./parseJsonLine.js");

describe("parseFileContent", () => {
  test("parses multiple lines of content", () => {
    const content = "line1\nline2\nline3";
    parseJsonLine
      .mockReturnValueOnce({ id: 1 })
      .mockReturnValueOnce({ id: 2 })
      .mockReturnValueOnce({ id: 3 });

    const result = parseFileContent(content);
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(parseJsonLine).toHaveBeenCalledTimes(3);
  });

  test("filters out empty lines", () => {
    const content = "line1\n\nline2\n\n\nline3";
    parseJsonLine
      .mockReturnValueOnce({ id: 1 })
      .mockReturnValueOnce({ id: 2 })
      .mockReturnValueOnce({ id: 3 });

    const result = parseFileContent(content);
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(parseJsonLine).toHaveBeenCalledTimes(3);
  });

  test("uses parseJsonLine for each non-empty line", () => {
    const content = "line1\nline2";
    parseJsonLine.mockReturnValueOnce({ id: 1 }).mockReturnValueOnce({ id: 2 });

    parseFileContent(content);
    expect(parseJsonLine).toHaveBeenCalledWith("line1");
    expect(parseJsonLine).toHaveBeenCalledWith("line2");
  });
});

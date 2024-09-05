import { jest } from "@jest/globals";
import loadData from "./loadData.js";
import readFile from "./readFile.js";
import parseFileContent from "./parseFileContent.js";
import filterValidEntries from "./filterValidEntries.js";

// Mock the imported functions
jest.mock("./readFile.js");
jest.mock("./parseFileContent.js");
jest.mock("./filterValidEntries.js");

describe("loadData", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("loads and parses data from file successfully", async () => {
    const mockContent = "file content";
    const mockParsedContent = [{ id: 1 }, { id: 2 }];
    const mockFilteredContent = [{ id: 1 }, { id: 2 }];

    // Use jest.fn() to create mock functions
    readFile.mockResolvedValue(mockContent);
    parseFileContent.mockReturnValue(mockParsedContent);
    filterValidEntries.mockReturnValue(mockFilteredContent);

    const result = await loadData("test.txt");
    expect(result).toEqual(mockFilteredContent);
    expect(readFile).toHaveBeenCalledWith("test.txt");
    expect(parseFileContent).toHaveBeenCalledWith(mockContent);
    expect(filterValidEntries).toHaveBeenCalledWith(mockParsedContent);
  });

  test("returns empty array if file does not exist", async () => {
    const error = new Error("File not found");
    error.code = "ENOENT";
    readFile.mockRejectedValue(error);

    const result = await loadData("nonexistent.txt");
    expect(result).toEqual([]);
  });

  test("rejects with error for other file reading errors", async () => {
    const error = new Error("Some other error");
    readFile.mockRejectedValue(error);

    await expect(loadData("error.txt")).rejects.toThrow("Some other error");
  });
});

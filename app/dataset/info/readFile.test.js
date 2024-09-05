import { jest } from "@jest/globals";
import { promises as fs } from "fs";
import readFile from "./readFile.js";

// Natural language description of the tests:
// 1. It should read the contents of a file successfully
// 2. It should throw an error if the file doesn't exist
// 3. It should handle empty files

jest.mock("fs/promises");

describe("readFile", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("reads file contents successfully", async () => {
    const mockContent = "file content";
    fs.readFile.mockResolvedValue(mockContent);

    const result = await readFile("test.txt");
    expect(result).toBe(mockContent);
    expect(fs.readFile).toHaveBeenCalledWith("test.txt", "utf-8");
  });

  test("throws error if file does not exist", async () => {
    const error = new Error("File not found");
    error.code = "ENOENT";
    fs.readFile.mockRejectedValue(error);

    await expect(readFile("nonexistent.txt")).rejects.toThrow("File not found");
  });

  test("handles empty files", async () => {
    fs.readFile.mockResolvedValue("");

    const result = await readFile("empty.txt");
    expect(result).toBe("");
  });
});

import { jest } from "@jest/globals";
import { promises as fs } from "fs";
import { loadDataset } from "./loadDataset.js";

// Mock fs.readFile
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe("loadDataset", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("loads valid dataset correctly", async () => {
    const mockData = `
      {"prompt": "Hello", "completion": "World", "fitness": 1}
      {"prompt": "Test", "completion": "Case"}
    `;
    fs.readFile.mockResolvedValue(mockData);

    const result = await loadDataset("data100.jsonl");
    expect(result).toEqual([
      { prompt: "Hello", completion: "World", fitness: 1 },
      { prompt: "Test", completion: "Case", fitness: 0 },
    ]);
  });

  test("filters out invalid JSON lines", async () => {
    const mockData = `
      {"prompt": "Valid", "completion": "JSON"}
      Invalid JSON
      {"prompt": "Another", "completion": "Valid"}
    `;
    fs.readFile.mockResolvedValue(mockData);

    const result = await loadDataset("data100.jsonl");
    expect(result).toEqual([
      { prompt: "Valid", completion: "JSON", fitness: 0 },
      { prompt: "Another", completion: "Valid", fitness: 0 },
    ]);
  });

  test("filters out entries missing prompt or completion", async () => {
    const mockData = `
      {"prompt": "Valid", "completion": "Entry"}
      {"prompt": "Missing Completion"}
      {"completion": "Missing Prompt"}
      {"prompt": "Another", "completion": "Valid"}
    `;
    fs.readFile.mockResolvedValue(mockData);

    const result = await loadDataset("data100.jsonl");
    expect(result).toEqual([
      { prompt: "Valid", completion: "Entry", fitness: 0 },
      { prompt: "Another", completion: "Valid", fitness: 0 },
    ]);
  });

  test("handles empty file", async () => {
    fs.readFile.mockResolvedValue("");

    const result = await loadDataset("dataset/empty.jsonl");
    expect(result).toEqual([]);
  });

  test("throws error on file read failure", async () => {
    fs.readFile.mockRejectedValue(new Error("File not found"));

    await expect(loadDataset("./badData.jsonl")).rejects.toThrow(
      "File not found"
    );
  });
});

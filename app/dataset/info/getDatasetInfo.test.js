import { jest } from "@jest/globals";
import getDatasetInfo from "./getDatasetInfo.js";
import loadData from "./loadData.js";
import ora from "ora";

jest.mock("./loadData.js");
jest.mock("ora");

describe("getDatasetInfo", () => {
  beforeEach(() => {
    ora.mockReturnValue({
      start: jest.fn().mockReturnThis(),
      succeed: jest.fn(),
    });
  });

  test("returns correct dataset info", async () => {
    loadData.mockResolvedValueOnce([1, 2, 3]).mockResolvedValueOnce([4, 5]);

    const result = await getDatasetInfo();
    expect(result).toEqual({
      unreviewedCount: 3,
      reviewedCount: 2,
      totalCount: 5,
    });
  });

  test("handles empty datasets", async () => {
    loadData.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const result = await getDatasetInfo();
    expect(result).toEqual({
      unreviewedCount: 0,
      reviewedCount: 0,
      totalCount: 0,
    });
  });

  test("uses ora for displaying loading progress", async () => {
    loadData.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await getDatasetInfo();
    expect(ora).toHaveBeenCalledWith("Loading dataset info...");
    expect(ora().start).toHaveBeenCalled();
    expect(ora().succeed).toHaveBeenCalledWith("Dataset info loaded!");
  });
});

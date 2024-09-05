import filterValidEntries from "./filterValidEntries.js";

// Natural language description of the tests:
// 1. It should filter out null entries
// 2. It should keep non-null entries
// 3. It should return an empty array if all entries are null

describe("filterValidEntries", () => {
  test("filters out null entries", () => {
    const entries = [{ id: 1 }, null, { id: 2 }, null, { id: 3 }];
    const result = filterValidEntries(entries);
    expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  test("keeps non-null entries", () => {
    const entries = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = filterValidEntries(entries);
    expect(result).toEqual(entries);
  });

  test("returns empty array if all entries are null", () => {
    const entries = [null, null, null];
    const result = filterValidEntries(entries);
    expect(result).toEqual([]);
  });
});

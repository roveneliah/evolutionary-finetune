import createProgressBar from "./createProgressBar.js";

// Natural language description of the tests:
// 1. It should create a progress bar with correct filled and empty portions
// 2. It should handle 0% progress
// 3. It should handle 100% progress

describe("createProgressBar", () => {
  test("creates progress bar with correct filled and empty portions", () => {
    const result = createProgressBar(5, 10);
    expect(result).toBe("█████░░░░░");
  });

  test("handles 0% progress", () => {
    const result = createProgressBar(0, 10);
    expect(result).toBe("░░░░░░░░░░");
  });

  test("handles 100% progress", () => {
    const result = createProgressBar(10, 10);
    expect(result).toBe("██████████");
  });
});

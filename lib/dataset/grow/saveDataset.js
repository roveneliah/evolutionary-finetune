import fs from "fs/promises";
import path from "path";

const saveDataset = async (dataset, directory) => {
  console.log("\n\nSaving dataset to", directory, "\n\n");
  const filePath = path.join(directory, "unreviewed.jsonl");

  // Read existing data
  let existingData = [];
  try {
    const content = await fs.readFile(filePath, "utf-8");
    existingData = content.split("\n").filter((line) => line.trim());
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  // Append new data
  const newData = dataset.map(JSON.stringify);
  const allData = [...existingData, ...newData];

  await fs.writeFile(filePath, allData.join("\n"));
  console.log(`Dataset appended to unreviewed.jsonl`);
};

export { saveDataset };

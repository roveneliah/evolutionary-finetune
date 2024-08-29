import fs from "fs/promises";
import { createRandomSubsets } from "./createRandomSubsets.js";

const validateFormat = (data) => {
  const hasMessages = Array.isArray(data.messages);
  const hasValidMessages =
    hasMessages &&
    data.messages.every(
      (msg) =>
        typeof msg === "object" &&
        ["system", "user", "assistant"].includes(msg.role) &&
        typeof msg.content === "string" &&
        (msg.role !== "assistant" || typeof msg.weight === "number")
    );

  return hasMessages && hasValidMessages;
};

export const loadDataset = async (path) => {
  try {
    const data = await fs.readFile(path, "utf-8");
    return data
      .split("\n")
      .filter(Boolean)
      .map((line, index) => {
        try {
          const parsed = JSON.parse(line);
          if (!validateFormat(parsed)) {
            throw new Error(
              `Invalid data format at line ${
                index + 1
              }. Expected format with 'messages' array containing valid message objects.`
            );
          }
          return {
            ...parsed,
            fitness: parsed.fitness || 0,
          };
        } catch (err) {
          console.error(`Error parsing line ${index + 1}: ${err.message}`);
          return null;
        }
      })
      .filter((item) => item !== null);
  } catch (err) {
    console.error(`Error loading dataset: ${err.message}`);
    throw err;
  }
};

const saveDataset = async (dataset, path) => {
  await fs.writeFile(path, dataset.map(JSON.stringify).join("\n"));
};

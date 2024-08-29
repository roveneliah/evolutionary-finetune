import { growDataset } from "../../lib/dataset/grow/index.js";
import fs from "fs/promises";

// Usage
const inputPath = "./data/data100.jsonl";
const outputDirectory = "./data/synthetic";
const promptPath = "./lib/dataset/grow/prompt.md";

// load prompt
const prompt = await fs.readFile(promptPath, "utf-8");

growDataset({
  inputPath,
  outputDirectory,
  numNewExamples: 100,
  provider: "ollama",
  prompt,
})
  .then(() => console.log("Dataset growth completed"))
  .catch((error) => console.error("Error growing dataset:", error));

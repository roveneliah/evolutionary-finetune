import OpenAI from "openai";
import fs from "fs";
import * as fsp from "fs/promises";
import dotenv from "dotenv";
import { EntrySchema } from "../lib/schema/datasetSchema.js";

dotenv.config();

const openai = new OpenAI();

// Helper functions
const createRandomSubsets = (dataset, numSubsets, subsetSizePercentage) => {
  const subsetSize = Math.floor(dataset.length * (subsetSizePercentage / 100));
  return Array.from({ length: numSubsets }, () =>
    dataset
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, subsetSize)
  );
};

const fineTune = async (datasetPath) => {
  const dataset = await loadDataset(datasetPath);
  const existingFiles = await openai.files.list();
  const fileExists = existingFiles.data.some((f) => f.filename === datasetPath);
  const file = fileExists
    ? (console.log("File already exists, using existing file"),
      existingFiles.data.find((f) => f.filename === datasetPath))
    : (console.log("File does not exist, uploading new file"),
      await openai.files.create({
        file: fs.createReadStream(datasetPath),
        purpose: "fine-tune",
      }));
  const fineTune = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: "gpt-4o-2024-08-06", // Update this to the appropriate model
  });

  console.log(fineTune);
};

const fineTuneSubset = async (subset) => {
  const tempFileName = `tmp/temp_subset_${Date.now()}.jsonl`;
  await fsp.writeFile(tempFileName, subset.map(JSON.stringify).join("\n"));

  const existingFiles = await openai.files.list();
  const fileExists = existingFiles.data.some(
    (f) => f.filename === tempFileName
  );

  const file = fileExists
    ? (console.log("File already exists, using existing file"),
      existingFiles.data.find((f) => f.filename === tempFileName))
    : (console.log("File does not exist, uploading new file"),
      await openai.files.create({
        file: fs.createReadStream(tempFileName),
        purpose: "fine-tune",
      }));

  const fineTune = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: "gpt-4o-2024-08-06", // Update this to the appropriate model
  });

  await fsp.unlink(tempFileName);

  return fineTune.id;
};

const updateDatasetFitness = (dataset, subsets, assessments) => {
  const bestSubsetIndex = assessments.indexOf(Math.max(...assessments));
  const worstSubsetIndex = assessments.indexOf(Math.min(...assessments));

  return dataset.map((item) => {
    if (subsets[bestSubsetIndex].includes(item)) {
      return { ...item, fitness: (item.fitness || 0) + 1 };
    } else if (subsets[worstSubsetIndex].includes(item)) {
      return { ...item, fitness: (item.fitness || 0) - 1 };
    }
    return item;
  });
};

export const loadDataset = async (path) => {
  try {
    const data = await fsp.readFile(path, "utf-8");
    return data
      .split("\n")
      .filter(Boolean)
      .map((line, index) => {
        try {
          const parsed = EntrySchema.parse(JSON.parse(line));
          return {
            ...parsed,
            fitness: 0, // Initialize fitness if not present
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

// Usage
const main = async () => {
  fineTune("data/data100.jsonl");
  // const dataset = await loadDataset("data/synthetic/reviewed.jsonl");
  // const subsets = createRandomSubsets(dataset, 2, 50);
  // const fineTunedModels = await Promise.all(subsets.map(fineTuneSubset));
  // console.log(fineTunedModels);
  // const testSuite = await import("./test_suite.js");
  // const updatedDataset = await finetune(dataset, 2, 0.5);
  // await saveDataset(updatedDataset, "updated_data100.jsonl");
};

main().catch(console.error);

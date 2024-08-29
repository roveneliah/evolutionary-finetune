import OpenAI from "openai";
import fs from "fs";
import * as fsp from "fs/promises";
import dotenv from "dotenv";
import { EntrySchema } from "../lib/schema/datasetSchema.js";
import inquirer from "inquirer";
import path from "path";
import figlet from "figlet";
import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";

dotenv.config();

const openai = new OpenAI();

// Cool animated header
const displayHeader = async () => {
  console.clear();
  const text = "AI Fine-Tuner";
  const fonts = ["Standard", "Big", "Slant", "Block", "Doom"];
  const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"];

  const spinner = ora("Preparing your fine-tuning experience...").start();

  for (let i = 0; i < fonts.length; i++) {
    console.clear();
    const font = fonts[i];
    const color = colors[i % colors.length];
    const figletText = figlet.textSync(text, { font });
    const coloredText = chalk[color](figletText);
    console.log(coloredText);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  spinner.succeed("Ready to fine-tune!");
  console.log(chalk.cyan("\nWelcome to the AI Fine-Tuning Tool!\n"));
};

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

const getJsonlFiles = async (directory) => {
  const files = await fsp.readdir(directory);
  return files.filter((file) => path.extname(file).toLowerCase() === ".jsonl");
};

const selectFile = async (directory) => {
  const files = await getJsonlFiles(directory);
  const { selectedFile } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedFile",
      message: "Select a JSONL file to fine-tune (or cancel):",
      choices: [...files, new inquirer.Separator(), "Cancel"],
    },
  ]);

  if (selectedFile === "Cancel") {
    return null;
  }

  return path.join(directory, selectedFile);
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
  const fineTuneJob = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: "gpt-4o-2024-08-06", // Update this to the appropriate model
  });

  return fineTuneJob;
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

const displayResult = (fineTuneJob) => {
  console.clear();
  const resultText = figlet.textSync("Fine-Tune Complete!", {
    font: "Standard",
  });
  console.log(chalk.green(resultText));

  const jobInfo = boxen(
    chalk.cyan(`Job ID: ${chalk.yellow(fineTuneJob.id)}\n`) +
      chalk.cyan(`Status: ${chalk.green(fineTuneJob.status)}\n`) +
      chalk.cyan(`Model: ${chalk.magenta(fineTuneJob.model)}\n`) +
      chalk.cyan(
        `Created At: ${chalk.yellow(
          new Date(fineTuneJob.created_at * 1000).toLocaleString()
        )}\n`
      ) +
      chalk.cyan(
        `View Job: ${chalk.blue.underline(
          `https://platform.openai.com/finetune/${fineTuneJob.id}?filter=all`
        )}`
      ),
    {
      padding: 1,
      margin: 1,
      borderStyle: "double",
      borderColor: "green",
      title: "Fine-Tuning Job Details",
      titleAlignment: "center",
    }
  );

  console.log(jobInfo);

  console.log(chalk.cyan("\nThank you for using the AI Fine-Tuning Tool!"));
  console.log(
    chalk.yellow("Remember to check the job status on the OpenAI platform.")
  );
};

// Usage
const main = async () => {
  await displayHeader();

  const dataDirectory = "data";
  const selectedFile = await selectFile(dataDirectory);

  if (selectedFile === null) {
    console.log(chalk.yellow("Operation cancelled."));
    return;
  }

  const spinner = ora("Fine-tuning in progress...").start();
  const fineTuneJob = await fineTune(selectedFile);
  spinner.succeed("Fine-tuning job created successfully!");

  displayResult(fineTuneJob);
};

main().catch(console.error);

import fs from "fs/promises";
import path from "path";
import { EntrySchema } from "../../lib/schema/datasetSchema.js";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";

const UNREVIEWED_FILE = "./data/synthetic/unreviewed.jsonl";
const REVIEWED_FILE = "./data/synthetic/reviewed.jsonl";

const readFile = async (filePath) => await fs.readFile(filePath, "utf-8");

const parseJsonLine = (line) => {
  try {
    return EntrySchema.parse(JSON.parse(line));
  } catch (error) {
    console.warn(chalk.yellow(`Invalid entry:`, line));
    return null;
  }
};

const filterValidEntries = (entries) =>
  entries.filter((entry) => entry !== null);

const parseFileContent = (content) =>
  content
    .split("\n")
    .filter((line) => line.trim())
    .map(parseJsonLine);

const loadData = async (filePath) => {
  try {
    const content = await readFile(filePath);
    return filterValidEntries(parseFileContent(content));
  } catch (error) {
    return error.code === "ENOENT" ? [] : Promise.reject(error);
  }
};

const getDatasetInfo = async () => {
  const spinner = ora("Loading dataset info...").start();
  const unreviewedData = await loadData(UNREVIEWED_FILE);
  const reviewedData = await loadData(REVIEWED_FILE);
  spinner.succeed("Dataset info loaded!");

  return {
    unreviewedCount: unreviewedData.length,
    reviewedCount: reviewedData.length,
    totalCount: unreviewedData.length + reviewedData.length,
  };
};

const createColorGradient = (text, colors) =>
  text
    .split("\n")
    .map((line, index) => chalk[colors[index % colors.length]](line))
    .join("\n");

const createProgressBar = (progress, width) =>
  "█".repeat(progress) + "░".repeat(width - progress);

const formatInfoLine = (label, value, color) =>
  chalk.cyan("│ ") +
  chalk.bold(label) +
  chalk[color](value.toString().padStart(5)) +
  chalk.cyan("│");

const displayInfo = (info) => {
  console.clear();

  const title = figlet.textSync("Dataset Info", { font: "Standard" });
  const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"];
  const coloredTitle = createColorGradient(title, colors);
  console.log(coloredTitle);

  console.log("\n");

  const progressBarWidth = 30;
  const progress = Math.floor(
    (info.reviewedCount / info.totalCount) * progressBarWidth
  );
  const progressBar = createProgressBar(progress, progressBarWidth);

  console.log(chalk.cyan("┌─────────────────────────────────────────┐"));
  console.log(formatInfoLine("Total entries:    ", info.totalCount, "green"));
  console.log(
    formatInfoLine("Reviewed entries: ", info.reviewedCount, "green")
  );
  console.log(
    formatInfoLine("Unreviewed entries: ", info.unreviewedCount, "yellow")
  );
  console.log(
    chalk.cyan("│ ") +
      chalk.bold("Progress: ") +
      chalk.blue(`[${progressBar}]`) +
      chalk.cyan("│")
  );
  console.log(chalk.cyan("└─────────────────────────────────────────┘"));

  console.log(
    "\n" + chalk.italic('Press "q" to quit or any other key to refresh.')
  );
};

const handleUserInput = (key, rl, updateFn) => {
  if (key.toString() === "q") {
    console.clear();
    console.log(chalk.green(figlet.textSync("Goodbye!", { font: "Standard" })));
    setTimeout(() => {
      rl.close();
      process.exit(0);
    }, 1000);
  } else {
    updateFn();
  }
};

const main = async () => {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  process.stdin.setRawMode(true);

  const updateInfo = async () => {
    const info = await getDatasetInfo();
    displayInfo(info);
  };

  await updateInfo();

  process.stdin.on("data", (key) => handleUserInput(key, rl, updateInfo));
};

main().catch(console.error);

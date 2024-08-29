import fs from "fs/promises";
import path from "path";
import { EntrySchema } from "../../lib/schema/datasetSchema.js";
import chalk from "chalk";
import ora from "ora";
import figlet from "figlet";

const UNREVIEWED_FILE = "./data/synthetic/unreviewed.jsonl";
const REVIEWED_FILE = "./data/synthetic/reviewed.jsonl";

const loadData = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return EntrySchema.parse(JSON.parse(line));
        } catch (error) {
          console.warn(
            chalk.yellow(`Invalid entry in ${path.basename(filePath)}:`, line)
          );
          return null;
        }
      })
      .filter((entry) => entry !== null);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
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

const displayInfo = (info) => {
  console.clear();

  // ASCII art title with gradient colors
  const title = figlet.textSync("Dataset Info", { font: "Standard" });
  const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"];
  const coloredTitle = title
    .split("\n")
    .map((line, index) => {
      const color = colors[index % colors.length];
      return chalk[color](line);
    })
    .join("\n");
  console.log(coloredTitle);

  console.log("\n");

  // Progress bar
  const progressBarWidth = 30;
  const progress = Math.floor(
    (info.reviewedCount / info.totalCount) * progressBarWidth
  );
  const progressBar =
    "█".repeat(progress) + "░".repeat(progressBarWidth - progress);

  console.log(chalk.cyan("┌─────────────────────────────────────────┐"));
  console.log(
    chalk.cyan("│ ") +
      chalk.bold("Total entries:    ") +
      chalk.green(info.totalCount.toString().padStart(5)) +
      chalk.cyan("│")
  );
  console.log(
    chalk.cyan("│ ") +
      chalk.bold("Reviewed entries: ") +
      chalk.green(info.reviewedCount.toString().padStart(5)) +
      chalk.cyan("│")
  );
  console.log(
    chalk.cyan("│ ") +
      chalk.bold("Unreviewed entries: ") +
      chalk.yellow(info.unreviewedCount.toString().padStart(3)) +
      chalk.cyan("│")
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

  process.stdin.on("data", async (key) => {
    if (key.toString() === "q") {
      console.clear();
      console.log(
        chalk.green(figlet.textSync("Goodbye!", { font: "Standard" }))
      );
      setTimeout(() => {
        rl.close();
        process.exit(0);
      }, 1000);
    } else {
      await updateInfo();
    }
  });
};

main().catch(console.error);

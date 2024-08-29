import fs from "fs/promises";
import path from "path";
import readline from "readline";
import { EntrySchema } from "../../lib/schema/datasetSchema.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const UNREVIEWED_FILE = "./data/synthetic/unreviewed.jsonl";
const REVIEWED_FILE = "./data/synthetic/reviewed.jsonl";

const loadUnreviewedData = async () => {
  try {
    const content = await fs.readFile(UNREVIEWED_FILE, "utf-8");
    return content
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return EntrySchema.parse(JSON.parse(line));
        } catch (error) {
          console.warn("Invalid entry:", line);
          console.warn("Error:", error.message);
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

const saveReviewedData = async (data) => {
  const content = data.map(JSON.stringify).join("\n");
  await fs.appendFile(REVIEWED_FILE, content + "\n");
};

const updateUnreviewedData = async (data) => {
  const content = data.map(JSON.stringify).join("\n");
  await fs.writeFile(UNREVIEWED_FILE, content);
};

const editEntry = async (entry) => {
  console.clear();
  console.log("Current entry:");
  console.log(JSON.stringify(entry, null, 2));
  console.log("\nEnter the new content for the assistant's message:");

  const input = await new Promise((resolve) => {
    rl.question("", resolve);
  });

  if (input.trim() === "") {
    return entry;
  }

  const updatedEntry = {
    ...entry,
    messages: [
      ...entry.messages.slice(0, 2),
      { ...entry.messages[2], content: input.trim() },
    ],
  };

  try {
    return EntrySchema.parse(updatedEntry);
  } catch (error) {
    console.log("Invalid entry. Keeping the original entry.");
    console.log("Error:", error.message);
    return entry;
  }
};

const reviewEntry = async (entry, index, total) => {
  console.clear();
  console.log(`Entry ${index + 1} of ${total}`);
  console.log(JSON.stringify(entry, null, 2));
  console.log(
    '\nPress "f" to delete, "j" to keep, "a" to edit, or "q" to quit'
  );

  const key = await new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim().toLowerCase());
    });
  });

  return key;
};

const reviewDataset = async (dataset) => {
  const reviewedData = [];
  const unreviewedData = [];

  for (let i = 0; i < dataset.length; i++) {
    let entry = dataset[i];
    let action;
    do {
      action = await reviewEntry(entry, i, dataset.length);
      if (action === "a") {
        entry = await editEntry(entry);
      }
    } while (action === "a");

    if (action === "j") {
      reviewedData.push(entry);
    } else if (action === "f") {
      unreviewedData.push(entry);
    } else if (action === "q") {
      unreviewedData.push(...dataset.slice(i));
      break;
    }
  }

  return { reviewedData, unreviewedData };
};

const main = async () => {
  const unreviewedData = await loadUnreviewedData();

  if (unreviewedData.length === 0) {
    console.log("No unreviewed data found. Exiting.");
    rl.close();
    return;
  }

  console.log(`Found ${unreviewedData.length} unreviewed entries.`);
  console.log("Press any key to start reviewing...");
  await new Promise((resolve) => process.stdin.once("data", resolve));

  const { reviewedData, unreviewedData: remainingUnreviewed } =
    await reviewDataset(unreviewedData);

  if (reviewedData.length > 0) {
    await saveReviewedData(reviewedData);
    console.log(`${reviewedData.length} entries appended to ${REVIEWED_FILE}`);
  }

  await updateUnreviewedData(remainingUnreviewed);
  console.log(
    `${remainingUnreviewed.length} entries remain in ${UNREVIEWED_FILE}`
  );

  rl.close();
};

main().catch(console.error);

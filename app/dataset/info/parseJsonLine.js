import { EntrySchema } from "../../../lib/schema/datasetSchema.js";
import chalk from "chalk";

const parseJsonLine = (line) => {
  try {
    return EntrySchema.parse(JSON.parse(line));
  } catch (error) {
    console.warn(chalk.yellow(`Invalid entry:`, line));
    return null;
  }
};

export default parseJsonLine;

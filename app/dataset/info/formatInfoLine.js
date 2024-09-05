import chalk from "chalk";

const formatInfoLine = (label, value, color) =>
  chalk.cyan("│ ") +
  chalk.bold(label) +
  chalk[color](value.toString().padStart(5)) +
  chalk.cyan("│");

export default formatInfoLine;

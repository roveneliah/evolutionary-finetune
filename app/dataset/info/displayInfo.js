import chalk from "chalk";
import figlet from "figlet";
import createColorGradient from "./createColorGradient.js";
import createProgressBar from "./createProgressBar.js";
import formatInfoLine from "./formatInfoLine.js";

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

export default displayInfo;

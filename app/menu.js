import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { spawn } from "child_process";
import ora from "ora";
import OpenAI from "openai";
import dotenv from "dotenv";
import open from "open";
import readline from "readline";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const displayTitle = () => {
  console.clear();
  const title = figlet.textSync("AI Dataset Manager", { font: "Standard" });
  const colors = ["red", "yellow", "green", "cyan", "blue", "magenta"];
  const coloredTitle = title
    .split("\n")
    .map((line, index) => {
      const color = colors[index % colors.length];
      return chalk[color](line);
    })
    .join("\n");
  console.log(coloredTitle);
  console.log(chalk.cyan("\nWelcome to the AI Dataset Manager!\n"));
};

const runCommand = (command, args) => {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", (code) => {
      resolve(code);
    });
  });
};

const mainMenu = async () => {
  const choices = [
    { name: "Review Dataset", value: "review" },
    { name: "Launch Fine-tune", value: "finetune" },
    { name: "View Dataset Info", value: "info" },
    { name: "View Fine-tune Jobs", value: "viewJobs" },
    { name: "Exit", value: "exit" },
  ];

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices,
    },
  ]);

  return action;
};

const handleAction = async (action) => {
  const spinner = ora();
  try {
    switch (action) {
      case "review":
        spinner.start("Launching dataset review...");
        spinner.stop();
        await runCommand("node", ["app/dataset/review.js"]);
        console.log(chalk.green("\nDataset review completed!"));
        break;
      case "finetune":
        spinner.start("Launching fine-tune process...");
        spinner.stop();
        await runCommand("node", ["app/finetune.js"]);
        console.log(chalk.green("\nFine-tune process completed!"));
        break;
      case "info":
        spinner.start("Fetching dataset info...");
        spinner.stop();
        await runCommand("node", ["app/dataset/info.js"]);
        break;
      case "viewJobs":
        // spinner.start("Fetching fine-tune jobs...");
        await displayFineTuneJobs();
        // spinner.stop();
        break;
      case "exit":
        console.log(
          chalk.green("\nThank you for using AI Dataset Manager. Goodbye!")
        );
        process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
};

const displayFineTuneJobs = async () => {
  const spinner = ora("Fetching fine-tune jobs...").start();
  const list = await openai.fineTuning.jobs.list();
  spinner.stop();

  const filteredJobs = list.data.filter(
    (job) => job.status === "failed" || job.status === "succeeded"
  );

  let currentIndex = 0;

  const displayCurrentJob = () => {
    console.clear();
    console.log(
      chalk.cyan(figlet.textSync("Fine-tune Jobs", { font: "Small" }))
    );

    const job = filteredJobs[currentIndex];
    const color = job.status === "failed" ? "red" : "green";

    console.log(
      chalk[color](`
Job ${currentIndex + 1} of ${filteredJobs.length}

ID: ${job.id}
Status: ${job.status}
Model: ${job.model}
Created: ${new Date(job.created_at * 1000).toLocaleString()}
${job.fine_tuned_model ? `Fine-tuned model: ${job.fine_tuned_model}` : ""}
`)
    );

    console.log(
      chalk.yellow(
        "\nPress 'a' for previous job, 'd' for next job, 'w' to open in browser, or 'q' to quit"
      )
    );
  };

  const handleKeyPress = async (str, key) => {
    if (key.ctrl && key.name === "c") {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      return;
    }

    switch (str) {
      case "a":
        currentIndex =
          (currentIndex - 1 + filteredJobs.length) % filteredJobs.length;
        displayCurrentJob();
        break;
      case "d":
        currentIndex = (currentIndex + 1) % filteredJobs.length;
        displayCurrentJob();
        break;
      case "w":
        const job = filteredJobs[currentIndex];
        const url = `https://platform.openai.com/finetune/${job.id}`;
        await open(url);
        console.log(chalk.green(`\nOpened ${url} in your default browser.`));
        break;
      case "q":
        process.stdin.setRawMode(false);
        process.stdin.pause();
        return;
    }
  };

  displayCurrentJob();

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", async (str, key) => {
      await handleKeyPress(str, key);
      if (str === "q" || (key.ctrl && key.name === "c")) {
        resolve();
      }
    });
  });
};

const displayJobDetails = async (job) => {
  console.clear();
  const colors = ["cyan", "magenta", "yellow", "green", "blue"];
  let colorIndex = 0;

  const printDetail = (label, value) => {
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    console.log(chalk[color](`${label}: ${value}`));
  };

  console.log(chalk.bold.underline(`Job Details for ${job.id}`));
  console.log();

  printDetail("Status", job.status);
  printDetail("Model", job.model);
  printDetail("Created at", new Date(job.created_at * 1000).toLocaleString());
  if (job.finished_at) {
    printDetail(
      "Finished at",
      new Date(job.finished_at * 1000).toLocaleString()
    );
  }
  printDetail("Fine-tuned model", job.fine_tuned_model || "N/A");
  printDetail("Training file", job.training_file);
  printDetail("Validation file", job.validation_file || "N/A");
  printDetail("Trained tokens", job.trained_tokens || "N/A");

  console.log();
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        { name: "Open in browser", value: "open" },
        { name: "Back to job list", value: "back" },
      ],
    },
  ]);

  if (action === "open") {
    const url = `https://platform.openai.com/finetune/${job.id}`;
    await open(url);
    console.log(chalk.green(`Opened ${url} in your default browser.`));
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (action === "back") {
    await displayFineTuneJobs();
  }
};

const main = async () => {
  while (true) {
    displayTitle();
    const action = await mainMenu();
    await handleAction(action);
    if (action !== "exit") {
      console.log("\nPress Enter to return to the main menu...");
      await new Promise((resolve) => process.stdin.once("data", resolve));
    } else {
      break;
    }
  }
};

main().catch(console.error);

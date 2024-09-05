import chalk from "chalk";
import figlet from "figlet";

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

export default handleUserInput;

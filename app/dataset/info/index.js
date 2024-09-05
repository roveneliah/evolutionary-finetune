import getDatasetInfo from "./getDatasetInfo.js";
import displayInfo from "./displayInfo.js";
import handleUserInput from "./handleUserInput.js";

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

import ora from "ora";
import loadData from "./loadData.js";
import { UNREVIEWED_FILE, REVIEWED_FILE } from "./constants.js";

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

export default getDatasetInfo;

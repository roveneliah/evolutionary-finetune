import { generateSyntheticData } from "./generateSyntheticData.js";
import { saveDataset } from "./saveDataset.js";
import { validateFormat } from "./validateFormat.js";
import { loadDataset } from "../loadDataset.js";

export const growDataset = async ({
  inputPath,
  outputDirectory,
  prompt,
  numNewExamples = 10,
  provider = null,
}) => {
  const existingData = await loadDataset(inputPath); // TODO: use these, inject into prompt
  const syntheticData = await generateSyntheticData({
    numNewExamples,
    provider,
    prompt,
  });
  console.log("\n\nSynthetic data\n\n");
  console.log(syntheticData);
  console.log("\n\n");
  await saveDataset(syntheticData, outputDirectory);
};

import readFile from "./readFile.js";
import parseFileContent from "./parseFileContent.js";
import filterValidEntries from "./filterValidEntries.js";

const loadData = async (filePath) => {
  try {
    const content = await readFile(filePath);
    return filterValidEntries(parseFileContent(content));
  } catch (error) {
    return error.code === "ENOENT" ? [] : Promise.reject(error);
  }
};

export default loadData;

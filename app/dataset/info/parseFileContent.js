import parseJsonLine from "./parseJsonLine.js";

const parseFileContent = (content) =>
  content
    .split("\n")
    .filter((line) => line.trim())
    .map(parseJsonLine);

export default parseFileContent;

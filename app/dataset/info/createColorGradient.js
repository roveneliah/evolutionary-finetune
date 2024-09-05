import chalk from "chalk";

const createColorGradient = (text, colors) =>
  text
    .split("\n")
    .map((line, index) => chalk[colors[index % colors.length]](line))
    .join("\n");

export default createColorGradient;

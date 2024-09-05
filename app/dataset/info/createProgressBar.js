const createProgressBar = (progress, width) =>
  "█".repeat(progress) + "░".repeat(width - progress);

export default createProgressBar;

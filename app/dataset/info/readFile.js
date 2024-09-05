import fs from "fs/promises";

const readFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("File not found");
    }
    throw error;
  }
};

export default readFile;

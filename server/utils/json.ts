import { readFile, writeFile } from "fs/promises";

export async function readJsonFileOrInit(path: string) {
  try {
    const data = await readFile(path, "utf8");
    return data.trim() ? JSON.parse(data) : {};
  } catch (e) {
    if (e.code === "ENOENT") {
      await writeFile(path, "{}");
      return {};
    }
    throw e;
  }
}

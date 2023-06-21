import fs from "node:fs";
import fsPromises from "node:fs/promises";

let idCounter = 0;

export function uniqueId(prefix = "") {
  const id = ++idCounter;

  return `${prefix}${id}`;
}

/**
 * Returns the contents of the specified file path as a JSON object.
 * @param {string} filePath Path to the JSON file
 * @return {Record<string, *>}
 */
export function readJsonSync(filePath) {
  const contents = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(contents);
}

/**
 * Writes the specified contents to the specified JSON file path sync.
 * @param {string} filePath JSON output file path
 * @param {Record<string, *>} contents Contents to write to JSON file
 */
export function writeJsonSync(filePath, contents) {
  fs.writeFileSync(filePath, JSON.stringify(contents, null, 2));
}

/**
 * Writes the specified contents to the specified JSON file path async.
 * @param {string} filePath JSON output file path
 * @param {Record<string, *>} contents Contents to write to JSON file
 */
export async function writeJson(filePath, contents) {
  await fsPromises.writeFile(filePath, JSON.stringify(contents, null, 2));
}

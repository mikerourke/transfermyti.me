import fs from "node:fs";
import fsPromises from "node:fs/promises";

import debug from "debug";

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
 * Writes the specified contents to the specified JSON file path.
 * @param {string} filePath JSON output file path
 * @param {Record<string, *>} contents Contents to write to JSON file
 */
export async function writeJson(filePath, contents) {
  await fsPromises.writeFile(filePath, JSON.stringify(contents, null, 2));
}

export class TaskRunner {
  #log;

  constructor(namespace) {
    this.#log = debug(`tmt:${namespace}`);
  }

  async run(message, taskFunction) {
    this.#log(message);

    try {
      await taskFunction();
    } catch (err) {
      if (typeof err === "string") {
        this.#log(err);
      } else {
        if ("stdout" in err || "stderr" in err) {
          if (err.stdout) {
            this.#log(err.stdout);
          }

          if (err.stderr) {
            this.#log(err.stderr);
          }
        }
      }

      process.exit(1);
    }
  }

  log(...message) {
    this.#log(...message);
  }
}

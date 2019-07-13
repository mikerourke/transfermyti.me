"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = "test";
process.env.PUBLIC_URL = "";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
  throw err;
});

const argv = process.argv.slice(2);

/**
 * If the `test` command was called in a CI instance, append the `--ci` CLI option
 * to the Jest runner to ensure the build doesn't fail
 * @see https://facebook.github.io/jest/docs/en/cli.html#ci
 */
if (process.env.CI) {
  argv.push("--ci=true");
}

require("jest").run(argv);

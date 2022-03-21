import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

dotenv.config();

import {
  deleteEntitiesInWorkspaces,
  writeEntitiesToOutputFile,
} from "./clockify.mjs";
import { startServer } from "./server.mjs";
import { runTests } from "./tests.mjs";

const RunAction = {
  ClockifyDelete: "clockify-delete",
  ClockifyWrite: "clockify-write",
  Serve: "serve",
  Tests: "tests",
};

yargs(hideBin(process.argv))
  .command({
    command: RunAction.ClockifyDelete,
    describe: "Delete all entities on Clockify testing workspace",
    handler: deleteEntitiesInWorkspaces,
  })
  .command({
    command: RunAction.ClockifyWrite,
    describe: "Grabs all Clockify entities and writes them to ./clockify.json",
    handler: writeEntitiesToOutputFile,
  })

  .command({
    command: RunAction.Serve,
    describe: "Start the mock server",
    builder: {
      emptyTools: {
        alias: "e",
        describe: "Tools that should return empty API responses",
        type: "array",
        choices: ["clockify", "toggl"],
        default: [],
        demandOption: false,
      },
    },
    handler: async (argv) => {
      const { emptyTools } = argv;
      if (emptyTools.includes("clockify")) {
        process.env.TMT_LOCAL_API_CLOCKIFY_EMPTY = "true";
      }

      if (emptyTools.includes("toggl")) {
        process.env.TMT_LOCAL_API_TOGGL_EMPTY = "true";
      }

      await startServer();
    },
  })

  .command({
    command: RunAction.Tests,
    describe: "Run the unit tests",
    handler: runTests,
  })

  .fail((message, err) => {
    if (message) {
      console.error(message);
    }
    if (err) {
      console.error(err);
    }
    process.exit(1);
  })
  .wrap(null)
  .help().argv;

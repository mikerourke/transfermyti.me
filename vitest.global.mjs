import { startServer } from "./scripts/server.mjs";

let server = null;

export async function setup() {
  server = await startServer({ emptyTools: [], port: 9009, silent: true });
}

export function teardown() {
  try {
    server?.close();
  } catch {
    // Do nothing
  }
}

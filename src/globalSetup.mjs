import { startServer } from "../scripts/server.mjs";

export function setup() {
  startServer({ emptyTools: [], port: 9009 });
}

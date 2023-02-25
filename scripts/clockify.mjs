import { rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { stringify } from "node:querystring";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { Listr } from "listr2";

import { readJsonSync, writeJson } from "./utilities.mjs";

const API_DELAY = 500;

const httpEnvPath = fileURLToPath(
  new URL(join("..", "http-client.private.env.json"), import.meta.url),
);

let httpEnv = {
  development: {
    "clockify-api-key": "",
    "clockify-user-id": "",
  },
};

try {
  httpEnv = readJsonSync(httpEnvPath);
} catch {
  // Do nothing. This is only for CI.
}

/**
 * You need to copy the http-client.private.env.example.json file in the root
 * directory (and get rid of ".example" from the name), then populate it with
 * these two keys to ensure you can actually use this file. It's part of
 * WebStorm's HTTP Client functionality that I use to test API requests
 * (see /requests directory in this repo, there isn't much to look at).
 */
const clockifyApiKey = httpEnv.development["clockify-api-key"];
const clockifyUserId = httpEnv.development["clockify-user-id"];

/**
 * Deletes the time entries, clients, tags, and projects from all workspaces.
 */
export async function deleteEntitiesInWorkspaces() {
  const tasks = new Listr(
    [
      {
        title: "Getting valid workspaces",
        task: async (ctx) => {
          ctx.workspaces = await fetchValidWorkspaces();
        },
      },
      {
        title: "Deleting entities in all workspaces",
        task: async (ctx, task) => {
          const subTasks = [];

          for (const workspace of ctx.workspaces) {
            subTasks.push({
              title: `Deleting entities in ${workspace.name}`,
              task: async (ctx, task) => {
                return task.newListr(
                  [
                    {
                      title: `Deleting time entries in ${workspace.name}`,
                      task: async (ctx, task) => {
                        await deleteEntityGroupInWorkspace(
                          workspace.id,
                          "time-entries",
                          task,
                        );
                        await setTimeout(1_000);
                      },
                    },
                    {
                      title: `Deleting clients in ${workspace.name}`,
                      task: async (ctx, task) => {
                        await deleteEntityGroupInWorkspace(
                          workspace.id,
                          "clients",
                          task,
                        );
                        await setTimeout(1_000);
                      },
                    },
                    {
                      title: `Deleting tags in ${workspace.name}`,
                      task: async (ctx, task) => {
                        await deleteEntityGroupInWorkspace(
                          workspace.id,
                          "tags",
                          task,
                        );
                        await setTimeout(1_000);
                      },
                    },
                    {
                      title: `Deleting projects in ${workspace.name}`,
                      task: async (ctx, task) => {
                        await deleteEntityGroupInWorkspace(
                          workspace.id,
                          "projects",
                          task,
                        );
                        await setTimeout(1_000);
                      },
                    },
                  ],
                  { concurrent: false },
                );
              },
            });
          }

          return task.newListr(subTasks, { concurrent: false });
        },
      },
    ],
    { concurrent: false },
  );

  await tasks.run({ workspaces: [] });
}

/**
 * Fetches the workspaces and corresponding projects, clients, tags, and time
 * entries for the user and outputs them to a "clockify.json" file in the CWD.
 */
export async function writeEntitiesToOutputFile() {
  const outputPath = resolve(process.cwd(), "clockify.json");

  try {
    await rm(outputPath);
  } catch {
    // Do nothing, file probably doesn't exist.
  }

  const addEntityGroupToWorkspaceData = async ({
    workspace,
    entityGroup,
    ctx,
    task,
  }) => {
    // noinspection UnnecessaryLocalVariableJS
    const contents = await getEntityGroupRecordsInWorkspace(
      workspace.id,
      entityGroup,
      task,
    );

    ctx.dataByWorkspaceName[workspace.name][entityGroup] = contents;

    await setTimeout(1_000);
  };

  const tasks = new Listr(
    [
      {
        title: "Fetching workspaces",
        task: async (ctx) => {
          ctx.workspaces = await fetchValidWorkspaces();
        },
      },
      {
        title: "Fetching entities in all workspaces",
        task: async (ctx, task) => {
          const subTasks = [];

          for (const workspace of ctx.workspaces) {
            ctx.dataByWorkspaceName[workspace.name] = {
              data: workspace,
            };

            subTasks.push({
              title: `Fetching entities in ${workspace.name}`,
              task: async (ctx, task) => {
                return task.newListr(
                  [
                    {
                      title: `Adding projects to ${workspace.name}`,
                      task: async (ctx, task) =>
                        await addEntityGroupToWorkspaceData({
                          workspace,
                          entityGroup: "projects",
                          ctx,
                          task,
                        }),
                    },
                    {
                      title: `Adding clients to ${workspace.name}`,
                      task: async (ctx, task) =>
                        await addEntityGroupToWorkspaceData({
                          workspace,
                          entityGroup: "clients",
                          ctx,
                          task,
                        }),
                    },
                    {
                      title: `Adding tags to ${workspace.name}`,
                      task: async (ctx, task) =>
                        await addEntityGroupToWorkspaceData({
                          workspace,
                          entityGroup: "tags",
                          ctx,
                          task,
                        }),
                    },
                    {
                      title: `Adding time entries to ${workspace.name}`,
                      task: async (ctx, task) =>
                        await addEntityGroupToWorkspaceData({
                          workspace,
                          entityGroup: "time-entries",
                          ctx,
                          task,
                        }),
                    },
                  ],
                  { concurrent: false },
                );
              },
            });
          }

          return task.newListr(subTasks, { concurrent: false });
        },
      },
      {
        title: "Writing entries to JSON file",
        task: async (ctx, task) => {
          await writeJson(outputPath, ctx.dataByWorkspaceName);

          task.output = `Clockify entities written to ${outputPath}`;
        },
      },
    ],
    { concurrent: false },
  );

  await tasks.run({ workspaces: [], dataByWorkspaceName: {} });
}

/**
 * Deletes all the entities in the specified group from the specified workspace.
 * @param {string} workspaceId
 * @param {string} entityGroup
 * @param {import("listr2").ListrTaskWrapper} task
 */
async function deleteEntityGroupInWorkspace(workspaceId, entityGroup, task) {
  if (entityGroup === "time-entries") {
    return await deleteTimeEntriesInWorkspace(workspaceId, task);
  }

  const entityRecords = await getEntityGroupRecordsInWorkspace(
    workspaceId,
    entityGroup,
    task,
  );

  if (!entityRecords || entityRecords.length === 0) {
    return (task.ouput = `No ${entityGroup} to delete.`);
  }

  const baseEndpoint = getEntityGroupEndpoint(workspaceId, entityGroup);

  const apiDeleteEntity = (entityId) =>
    clockifyFetch(`${baseEndpoint}/${entityId}`, { method: "DELETE" });

  task.output = `Deleting ${entityGroup} in workspace...`;

  for (const { id, name } of entityRecords) {
    try {
      await apiDeleteEntity(id);

      await setTimeout(API_DELAY);

      task.output = `Delete ${name} successful`;
    } catch (err) {
      task.output = `Error deleting ${entityGroup}: ${err}`;
    }
  }
}

/**
 * Fetches the records in the specified entity group and workspace.
 * @param {string} workspaceId
 * @param {string} entityGroup
 * @param {import("listr2").ListrTaskWrapper} task
 */
async function getEntityGroupRecordsInWorkspace(
  workspaceId,
  entityGroup,
  task,
) {
  if (entityGroup === "time-entries") {
    return await fetchTimeEntriesInWorkspace(workspaceId, task);
  } else {
    const endpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
    return await clockifyFetch(endpoint);
  }
}

/**
 * Returns the endpoint for the specified workspace and entity group.
 */
function getEntityGroupEndpoint(workspaceId, entityGroup) {
  return `/workspaces/${workspaceId}/${entityGroup}`;
}

/**
 * Deletes all the time entries in the specified workspace.
 * @param {string} workspaceId
 * @param {import("listr2").ListrTaskWrapper} task
 */
async function deleteTimeEntriesInWorkspace(workspaceId, task) {
  const timeEntries = await fetchTimeEntriesInWorkspace(workspaceId, task);

  const apiDeleteTimeEntryById = (entryId) =>
    clockifyFetch(`/workspaces/${workspaceId}/time-entries/${entryId}`, {
      method: "DELETE",
    });

  const totalEntryCount = timeEntries.length;
  let currentEntry = 1;

  for (const { id } of timeEntries) {
    try {
      await apiDeleteTimeEntryById(id);

      task.output = `Deleted ${currentEntry} of ${totalEntryCount}`;

      currentEntry += 1;

      await setTimeout(API_DELAY);
    } catch (err) {
      task.output = `Error deleting time entries: ${err}`;
    }
  }
}

/**
 * Fetches all time entries (for all years) for the specified workspace ID.
 * @param {string} workspaceId
 * @param {import("listr2").ListrTaskWrapper} task
 */
async function fetchTimeEntriesInWorkspace(workspaceId, task) {
  const apiFetchTimeEntriesForYear = (page) => {
    const endpointUrl = [
      "workspaces",
      workspaceId,
      "user",
      clockifyUserId,
      "time-entries",
    ].join("/");
    const query = stringify({ page, "page-size": 100 });

    return clockifyFetch(`/${endpointUrl}?${query}`, {
      method: "GET",
    });
  };

  const allEntries = [];

  let keepFetching = true;
  let currentPage = 1;

  while (keepFetching) {
    try {
      const timeEntries = await apiFetchTimeEntriesForYear(currentPage);

      keepFetching = timeEntries.length === 100;
      allEntries.push(timeEntries);

      // prettier-ignore
      task.output = `Fetched ${timeEntries.length} entries for page ${currentPage}`;
    } catch (err) {
      keepFetching = false;

      task.output = `Error fetching time entries: ${err}`;
    }

    currentPage += 1;
  }

  return allEntries.flat();
}

/**
 * Fetches the workspaces from Clockify and excludes one of the workspaces
 * I had an issue with.
 */
async function fetchValidWorkspaces() {
  const workspaceResults = await clockifyFetch("/workspaces");

  return workspaceResults.reduce((acc, workspace) => {
    // This is due to an issue with one of my workspaces that wasn't deleted
    // properly (I suspect it may have been a Clockify bug). If I try deleting
    // stuff from here, I get all kinds of errors:
    if (/Pandera/.test(workspace.name)) {
      return acc;
    }

    return [...acc, workspace];
  }, []);
}

/**
 * Makes a fetch call to the Clockify API to the specified endpoint with
 * specified options.
 * @param {string} endpoint
 * @param {RequestInit | undefined} [options]
 */
async function clockifyFetch(endpoint, options) {
  let rootUrl = "https://api.clockify.me/api";
  if (!/tags|clients/gi.test(endpoint)) {
    rootUrl += "/v1";
  }
  const fullUrl = `${rootUrl}${endpoint}`;

  const requestOptions = {
    headers: {
      "X-Api-Key": clockifyApiKey,
      "Content-Type": "application/json",
    },
    ...options,
  };

  // Make sure the request body is stringified and the "Accept" header is
  // present (for POST request):
  if ((requestOptions?.body ?? null) !== null) {
    Object.assign(requestOptions.headers, {
      Accept: "application/json",
    });

    requestOptions.body = JSON.stringify(requestOptions.body);
  }
  const response = await fetch(fullUrl, requestOptions);

  try {
    return await response.json();
  } catch (err) {
    if (/invalid json/.test(err.message)) {
      return Promise.resolve();
    }
    return Promise.reject(err);
  }
}

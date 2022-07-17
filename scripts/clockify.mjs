import fsPromises from "node:fs/promises";
import path from "node:path";
import qs from "node:querystring";
import { fileURLToPath, URL } from "node:url";

import fetch from "node-fetch";

import { readJsonSync, TaskRunner, writeJson } from "./utilities.mjs";

const task = new TaskRunner("clockify");

const API_DELAY = 500;

const httpEnvPath = fileURLToPath(
  new URL(path.join("..", "http-client.private.env.json"), import.meta.url),
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
  const workspaces = await fetchValidWorkspaces();

  // Wait 1 second between each entity group, just to hedge my bets:
  for (const workspace of workspaces) {
    task.log(`Processing ${workspace.name}...`);

    await deleteEntityGroupInWorkspace(workspace.id, "time-entries");
    await pause(1000);

    await deleteEntityGroupInWorkspace(workspace.id, "clients");
    await pause(1000);

    await deleteEntityGroupInWorkspace(workspace.id, "tags");
    await pause(1000);

    await deleteEntityGroupInWorkspace(workspace.id, "projects");
    task.log(`Processing complete for ${workspace.name}`);
  }
}

/**
 * Fetches the workspaces and corresponding projects, clients, tags, and time
 * entries for the user and outputs them to a "clockify.json" file in the CWD.
 */
export async function writeEntitiesToOutputFile() {
  const outputPath = path.resolve(process.cwd(), "clockify.json");

  await fsPromises.rm(outputPath);

  const workspaces = await fetchValidWorkspaces();
  const dataByWorkspaceName = {};

  const addEntityGroupToWorkspaceData = async (id, name, entityGroup) => {
    // noinspection UnnecessaryLocalVariableJS
    const contents = await getEntityGroupRecordsInWorkspace(id, entityGroup);

    dataByWorkspaceName[name][entityGroup] = contents;
  };

  for (const { id, name, ...workspace } of workspaces) {
    task.log(`Processing ${name}...`);

    dataByWorkspaceName[name].data = { id, ...workspace };

    await addEntityGroupToWorkspaceData(id, name, "projects");
    await pause(1000);

    await addEntityGroupToWorkspaceData(id, name, "clients");
    await pause(1000);

    await addEntityGroupToWorkspaceData(id, name, "tags");
    await pause(1000);

    await addEntityGroupToWorkspaceData(id, name, "time-entries");
  }

  await writeJson(outputPath, dataByWorkspaceName);
  task.log("Clockify entities written to file!");
}

/**
 * Deletes all the entities in the specified group from the specified workspace.
 */
async function deleteEntityGroupInWorkspace(workspaceId, entityGroup) {
  if (entityGroup === "time-entries") {
    return await deleteTimeEntriesInWorkspace(workspaceId);
  }

  const entityRecords = await getEntityGroupRecordsInWorkspace(
    workspaceId,
    entityGroup,
  );

  if (!entityRecords || entityRecords.length === 0) {
    return task.log(`No ${entityGroup} to delete.`);
  }

  const baseEndpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
  const apiDeleteEntity = (entityId) =>
    clockifyFetch(`${baseEndpoint}/${entityId}`, { method: "DELETE" });

  task.log(`Deleting ${entityGroup} in workspace...`);

  for (const { id, name } of entityRecords) {
    try {
      await apiDeleteEntity(id);

      await pause(API_DELAY);

      task.log(`Delete ${name} successful`);
    } catch (err) {
      task.log(`Error deleting ${entityGroup}: ${err}`);
    }
  }
}

/**
 * Fetches the records in the specified entity group and workspace.
 */
async function getEntityGroupRecordsInWorkspace(workspaceId, entityGroup) {
  if (entityGroup === "time-entries") {
    return await fetchTimeEntriesInWorkspace(workspaceId);
  }

  const endpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
  return await clockifyFetch(endpoint);
}

/**
 * Returns the endpoint for the specified workspace and entity group.
 */
function getEntityGroupEndpoint(workspaceId, entityGroup) {
  return `/workspaces/${workspaceId}/${entityGroup}`;
}

/**
 * Deletes all the time entries in the specified workspace.
 */
async function deleteTimeEntriesInWorkspace(workspaceId) {
  const timeEntries = await fetchTimeEntriesInWorkspace(workspaceId);

  const apiDeleteTimeEntryById = (entryId) =>
    clockifyFetch(`/workspaces/${workspaceId}/time-entries/${entryId}`, {
      method: "DELETE",
    });

  const totalEntryCount = timeEntries.length;
  let currentEntry = 1;

  for (const { id } of timeEntries) {
    try {
      await apiDeleteTimeEntryById(id);

      task.log(`Deleted ${currentEntry} of ${totalEntryCount}`);

      currentEntry += 1;

      await pause(API_DELAY);
    } catch (err) {
      task.log(`Error deleting time entries: ${err}`);
    }
  }
}

/**
 * Pause execution for the specified milliseconds. This is used to ensure the
 * rate limits aren't exceeded.
 */
function pause(duration = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Fetches all time entries (for all years) for the specified workspace ID.
 */
async function fetchTimeEntriesInWorkspace(workspaceId) {
  const apiFetchTimeEntriesForYear = (page) => {
    const endpointUrl = [
      "workspaces",
      workspaceId,
      "user",
      clockifyUserId,
      "time-entries",
    ].join("/");
    const query = qs.stringify({ page, "page-size": 100 });

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
      task.log(`Fetched ${timeEntries.length} entries for page ${currentPage}`);
    } catch (err) {
      keepFetching = false;

      task.log(`Error fetching time entries: ${err}`);
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

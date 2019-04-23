const path = require('path');
const fetch = require('node-fetch');
const { cyan, green, magenta, yellow } = require('chalk');
const fs = require('fs-extra');
const dateFns = require('date-fns');
const _ = require('lodash');
const jsonFile = require('jsonfile');
const yargs = require('yargs');
const PromiseThrottle = require('promise-throttle');
const httpEnv = require('../http-client.private.env.json');

/**
 * You need to copy the http-client.private.env.example.json file in the root
 * directory (and get rid of ".example" from the name), then populate it with
 * these two keys to ensure you can actually use this file. It's part of
 * WebStorm's HTTP Client functionality that I use to test API requests
 * (see /requests directory in this repo, there isn't much to look at).
 */
const clockifyApiKey = httpEnv.development['clockify-api-key'];
const clockifyUserId = httpEnv.development['clockify-user-id'];

yargs
  .command({
    command: 'delete',
    desc: 'Delete all entities on Clockify testing workspace',
    handler: async () => {
      await deleteEntitiesInWorkspaces();
    },
  })
  .command({
    command: 'write',
    desc:
      'Grabs all the Clockify entities and writes them to clockify.json in CWD',
    handler: async () => {
      await writeEntitiesToOutputFile();
    },
  })
  .help().argv;

/**
 * Deletes the time entries, clients, tags, and projects from all workspaces.
 */
async function deleteEntitiesInWorkspaces() {
  const workspaces = await fetchValidWorkspaces();

  // Wait 1 second between each entity group, just to hedge my bets:
  for (const workspace of workspaces) {
    console.log(cyan(`Processing ${workspace.name}...`));
    await deleteEntityGroupInWorkspace(workspace.id, 'timeEntries');
    await pause(1);

    await deleteEntityGroupInWorkspace(workspace.id, 'clients');
    await pause(1);

    await deleteEntityGroupInWorkspace(workspace.id, 'tags');
    await pause(1);

    await deleteEntityGroupInWorkspace(workspace.id, 'projects');
    console.log(green(`Processing complete for ${workspace.name}`));
  }
}

/**
 * Fetches the workspaces and corresponding projects, clients, tags, and time
 * entries for the user and outputs them to a "clockify.json" file in the CWD.
 */
async function writeEntitiesToOutputFile() {
  const outputPath = path.resolve(process.cwd(), 'clockify.json');
  await fs.remove(outputPath);

  const workspaces = await fetchValidWorkspaces();
  const dataByWorkspaceName = {};

  const addEntityGroupToWorkspaceData = async (id, name, entityGroup) => {
    const contents = await getEntityGroupRecordsInWorkspace(id, entityGroup);
    _.set(dataByWorkspaceName, [name, entityGroup], contents);
  };

  for (const { id, name, ...workspace } of workspaces) {
    console.log(cyan(`Processing ${name}...`));
    _.set(dataByWorkspaceName, [name, 'data'], { id, ...workspace });
    await addEntityGroupToWorkspaceData(id, name, 'projects');
    await pause(1);

    await addEntityGroupToWorkspaceData(id, name, 'clients');
    await pause(1);

    await addEntityGroupToWorkspaceData(id, name, 'tags');
    await pause(1);

    await addEntityGroupToWorkspaceData(id, name, 'timeEntries');
  }

  await jsonFile.writeFile(outputPath, dataByWorkspaceName, { spaces: 2 });
  console.log(green('Clockify entities written to file!'));
}

/**
 * Deletes all of the entities in the specified group from the specified
 *    workspace.
 */
async function deleteEntityGroupInWorkspace(workspaceId, entityGroup) {
  if (entityGroup === 'timeEntries') {
    return await deleteTimeEntriesInWorkspace(workspaceId);
  }

  const entityRecords = await getEntityGroupRecordsInWorkspace(
    workspaceId,
    entityGroup,
  );

  if (!entityRecords || entityRecords.length === 0) {
    return console.log(yellow(`No ${entityGroup} to delete.`));
  }

  const baseEndpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
  const apiDeleteEntity = entityId =>
    clockifyFetch(`${baseEndpoint}${entityId}`, { method: 'DELETE' });

  const { promiseThrottle, throttledFn } = buildThrottler(apiDeleteEntity);

  console.log(cyan(`Deleting ${entityGroup} in workspace...`));
  for (const { id, name } of entityRecords) {
    await promiseThrottle
      .add(throttledFn.bind(this, id))
      .then(() => {
        console.log(green(`Delete ${name} successful`));
      })
      .catch(error => {
        console.log(magenta(`Error deleting ${entityGroup}: ${error}`));
      });
  }
}

/**
 * Fetches the records in the specified entity group and workspace.
 */
async function getEntityGroupRecordsInWorkspace(workspaceId, entityGroup) {
  if (entityGroup === 'timeEntries') {
    return await fetchTimeEntriesInWorkspace(workspaceId);
  }

  if (entityGroup === 'projects') {
    const options = {
      method: 'POST',
      body: {
        page: 0,
        pageSize: 100,
        search: '',
        clientIds: [],
        userFilterIds: [],
        sortOrder: 'ASCENDING',
        sortColumn: 'name',
      },
    };
    const result = await clockifyFetch(
      `/workspaces/${workspaceId}/projects/filtered`,
      options,
    );
    return _.get(result, 'project', []);
  }

  const endpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
  return await clockifyFetch(endpoint);
}

/**
 * Returns the endpoint for the specified workspace and entity group.
 */
function getEntityGroupEndpoint(workspaceId, entityGroup) {
  return `/workspaces/${workspaceId}/${entityGroup}/`;
}

/**
 * Deletes all the time entries in the specified workspace.
 */
async function deleteTimeEntriesInWorkspace(workspaceId) {
  const timeEntries = await fetchTimeEntriesInWorkspace(workspaceId);

  const apiDeleteTimeEntryById = entryId =>
    clockifyFetch(`/workspaces/${workspaceId}/timeEntries/${entryId}`, {
      method: 'DELETE',
    });

  const { promiseThrottle, throttledFn } = buildThrottler(
    apiDeleteTimeEntryById,
  );

  const totalEntryCount = timeEntries.length;
  let currentEntry = 1;

  for (const { id } of timeEntries) {
    await promiseThrottle
      .add(throttledFn.bind(this, id))
      .then(() => {
        console.log(green(`Deleted ${currentEntry} of ${totalEntryCount}`));
        currentEntry += 1;
      })
      .catch(error => {
        console.log(magenta(`Error deleting time entries: ${error}`));
      });
  }
}

/**
 * Pause execution for the specified seconds. This is used to ensure the
 * rate limits aren't exceeded.
 */
function pause(seconds = 1) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

/**
 * Fetches all time entries (for all years) for the specified workspace ID.
 */
async function fetchTimeEntriesInWorkspace(workspaceId) {
  const apiFetchTimeEntriesForYear = year => {
    const { firstDay, lastDay } = getFirstAndLastDayOfYear(year);
    return clockifyFetch(
      `/workspaces/${workspaceId}/timeEntries/user/${clockifyUserId}/entriesInRange`,
      {
        method: 'POST',
        body: {
          start: firstDay,
          end: lastDay,
        },
      },
    );
  };

  const { promiseThrottle, throttledFn } = buildThrottler(
    apiFetchTimeEntriesForYear,
  );

  const allYearsEntries = [];

  const yearsToFetch = [2018, 2017, 2016];
  for (const yearToFetch of yearsToFetch) {
    await promiseThrottle
      .add(throttledFn.bind(this, yearToFetch))
      .then(timeEntries => {
        allYearsEntries.push(timeEntries);
        console.log(
          green(`Fetched ${timeEntries.length} entries for ${yearToFetch}`),
        );
      })
      .catch(error => {
        console.log(magenta(`Error fetching time entries: ${error}`));
      });
  }

  return _.flatten(allYearsEntries);
}

/**
 * Fetches the workspaces from Clockify and excludes one of the workspaces
 * I had an issue with.
 */
async function fetchValidWorkspaces() {
  const workspaceResults = await clockifyFetch('/workspaces/');
  return workspaceResults.reduce((acc, workspace) => {
    // This is due to an issue with one of my workspaces that wasn't deleted
    // properly (I suspect it may have been a Clockify bug). If I try deleting
    // stuff from here, I get all kinds of errors:
    if (/Pandera/.test(workspace.name)) return acc;

    return [...acc, workspace];
  }, []);
}

/**
 * Returns a PromiseThrottle instance and throttler function for throttling
 *    API requests.
 */
function buildThrottler(fetchFunc) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const throttledFn = (...args) =>
    new Promise((resolve, reject) =>
      fetchFunc
        .call(null, ...args)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        }),
    );

  return {
    promiseThrottle,
    throttledFn,
  };
}

/**
 * Makes a fetch call to the Clockify API to the specifed endpoint with
 *    specified options.
 */
async function clockifyFetch(endpoint, options) {
  const fullUrl = `https://api.clockify.me/api${endpoint}`;

  let requestOptions = {
    headers: {
      'X-Api-Key': clockifyApiKey,
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Make sure the request body is stringified and the "Accept" header is
  // present (for POST request):
  if (!_.isNil(requestOptions.body)) {
    Object.assign(requestOptions.headers, {
      Accept: 'application/json',
    });
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  const response = await fetch(fullUrl, requestOptions);

  try {
    return await response.json();
  } catch (error) {
    if (/invalid json/.test(error.message)) {
      return Promise.resolve();
    }
    return Promise.reject(error);
  }
}

/**
 * Returns the first and last day of the year (in ISO format) for specifying
 *    the date range of time entries.
 */
function getFirstAndLastDayOfYear(year) {
  const currentDate = new Date();
  currentDate.setFullYear(year);

  // Determine the offset hours to get an accurate start and end time:
  const utcOffsetHours = currentDate.getTimezoneOffset() / 60;

  let firstDay = dateFns.startOfYear(currentDate);
  let lastDay = dateFns.endOfYear(currentDate);

  // In order to get the correct date/time, we need to ensure the toISOString()
  // doesn't return the UTC offset date/time. This either adds or subtracts
  // hours to ensure the times are accurate:
  const dateMathFn = utcOffsetHours < 0 ? dateFns.addHours : dateFns.subHours;
  firstDay = dateMathFn(firstDay, utcOffsetHours);
  lastDay = dateMathFn(lastDay, utcOffsetHours);

  return {
    firstDay: firstDay.toISOString(),
    lastDay: lastDay.toISOString(),
  };
}

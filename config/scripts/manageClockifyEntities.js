const fs = require('fs');
const path = require('path');
const readline = require('readline');
const fetch = require('node-fetch');
const dateFns = require('date-fns');
const isNil = require('lodash/isNil');
const flatten = require('lodash/flatten');
const set = require('lodash/set');
const jsonFile = require('jsonfile');
const PromiseThrottle = require('promise-throttle');
const httpEnv = require('../../http-client.private.env.json');

/**
 * You need to copy the http-client.private.env.example.json file in the
 *    root directory (and get rid of ".example" from the name), then populate
 *    it with these two keys to ensure you can actually use this file.
 *    It's part of WebStorm's HTTP Client functionality that I use to test API
 *    requests (see /requests directory in this repo, there isn't much to look
 *    at).
 */
const clockifyApiKey = httpEnv.development['clockify-api-key'];
const clockifyUserId = httpEnv.development['clockify-user-id'];

/**
 * Makes a fetch call to the Clockify API to the specifed endpoint with
 *    specified options.
 * @param {string} endpoint
 * @param {Object} [options]
 * @returns {Promise<*>}
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
  if (!isNil(requestOptions.body)) {
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
 * Returns a PromiseThrottle instance and throttler function for throttling
 *    API requests.
 * @param {Function} fetchFn
 * @returns {{promiseThrottle, throttledFn: (function(...[*]): Promise<any>)}}
 */
function buildThrottler(fetchFn) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const throttledFn = (...args) =>
    new Promise((resolve, reject) =>
      fetchFn
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
 * Returns the first and last day of the year (in ISO format) for specifying
 *    the date range of time entries.
 * @param {number} year
 * @returns {{firstDay: string, lastDay: string}}
 */
const getFirstAndLastDayOfYear = year => {
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
};

/**
 * Fetches all time entries (for all years) for the specified workspace ID.
 * @param {string} workspaceId
 * @returns {Promise<void>}
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
        console.log(`Fetched ${timeEntries.length} entries for ${yearToFetch}`);
      });
  }

  return flatten(allYearsEntries);
}

/**
 * Deletes all the time entries in the specified workspace.
 * @param workspaceId
 * @returns {Promise<void>}
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
    await promiseThrottle.add(throttledFn.bind(this, id)).then(() => {
      console.log(`Deleted ${currentEntry} of ${totalEntryCount}`);
      currentEntry += 1;
    });
  }
}

/**
 * Returns the endpoint for the specified workspace and entity group.
 * @param {string} workspaceId
 * @param {string} entityGroup
 * @returns {string}
 */
const getEntityGroupEndpoint = (workspaceId, entityGroup) =>
  `/workspaces/${workspaceId}/${entityGroup}/`;

/**
 * Fetches the records in the specified entity group and workspace.
 * @param {string} workspaceId
 * @param {string} entityGroup
 * @returns {Promise<*>}
 */
async function getEntityGroupRecordsInWorkspace(workspaceId, entityGroup) {
  if (entityGroup === 'timeEntries') {
    return await fetchTimeEntriesInWorkspace(workspaceId);
  }

  const endpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
  return await clockifyFetch(endpoint);
}

/**
 * Deletes all of the entities in the specified group from the specified
 *    workspace.
 * @param {string} workspaceId
 * @param {string} entityGroup
 * @returns {Promise<void>}
 */
async function deleteEntityGroupInWorkspace(workspaceId, entityGroup) {
  if (entityGroup === 'timeEntries') {
    return await deleteTimeEntriesInWorkspace(workspaceId);
  }

  const entityRecords = await getEntityGroupRecordsInWorkspace(
    workspaceId,
    entityGroup,
  );

  if (entityRecords.length === 0) {
    return console.log(`No ${entityGroup} to delete.`);
  }

  const baseEndpoint = getEntityGroupEndpoint(workspaceId, entityGroup);
  const apiDeleteEntity = entityId =>
    clockifyFetch(`${baseEndpoint}${entityId}`, { method: 'DELETE' });

  const { promiseThrottle, throttledFn } = buildThrottler(apiDeleteEntity);

  console.log(`Deleting ${entityGroup} in workspace...`);
  for (const { id, name } of entityRecords) {
    await promiseThrottle.add(throttledFn.bind(this, id)).then(() => {
      console.log(`Delete ${name} successful`);
    });
  }
}

/**
 * Pause execution for the specified seconds. This is used to ensure the
 *    rate limits aren't exceeded.
 * @param {number} seconds Number of seconds to pause for.
 * @returns {Promise<any>}
 */
const pause = (seconds = 1) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });

/**
 * Fetches the workspaces from Clockify and excludes one of the workspaces
 *    I had an issue with.
 * @returns {Promise<*>}
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
 * Deletes the time entries, clients, tags, and projects from all workspaces.
 * @returns {Promise<void>}
 */
async function deleteEntitiesInWorkspaces() {
  const workspaces = await fetchValidWorkspaces();

  // Wait 1 second between each entity group, just to hedge my bets:
  for (const workspace of workspaces) {
    console.log(`Processing ${workspace.name}...`);
    await deleteEntityGroupInWorkspace(workspace.id, 'timeEntries');
    await pause(1);
    await deleteEntityGroupInWorkspace(workspace.id, 'clients');
    await pause(1);
    await deleteEntityGroupInWorkspace(workspace.id, 'tags');
    await pause(1);
    await deleteEntityGroupInWorkspace(workspace.id, 'projects');
    console.log(`Processing complete for ${workspace.name}`);
  }
}

/**
 * Promisified jsonFile.writeFile.
 * @param {string} filePath
 * @param {object} contents
 * @returns {Promise<any>}
 */
async function writeToJsonAsync(filePath, contents) {
  return new Promise((resolve, reject) => {
    jsonFile.writeFile(filePath, contents, { spaces: 2 }, error => {
      if (error) reject(error);
      resolve();
    });
  });
}

/**
 * Checks if the file already exists and ask the user if they want to delete
 *    it. If "y" is specified, delete the file and return true.
 * @param {string} outputPath
 * @returns {Promise<boolean>}
 */
async function confirmIfFileExisting(outputPath) {
  return new Promise(resolve => {
    if (!fs.existsSync(outputPath)) return resolve(true);

    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    reader.question(
      'A file named "clockify.json" already exists in the current directory! Delete it? (y/n): ',
      answer => {
        if (/y/gi.test(answer)) {
          reader.close();
          fs.unlinkSync(outputPath);
          return resolve(true);
        } else {
          reader.close();
          return resolve(false);
        }
      },
    );
  });
}

/**
 * Fetches the workspaces and corresponding projects, clients, tags, and time
 *    entries for the user and outputs them to a "clockify.json" file in the
 *    CWD.
 * @returns {Promise<void>}
 */
async function writeEntitiesToOutputFile() {
  const outputPath = path.resolve(process.cwd(), 'clockify.json');
  const canProceed = await confirmIfFileExisting(outputPath);
  if (!canProceed) return;

  const workspaces = await fetchValidWorkspaces();
  const dataByWorkspaceName = {};

  const addEntityGroupToWorkspaceData = async (id, name, entityGroup) => {
    const contents = await getEntityGroupRecordsInWorkspace(id, entityGroup);
    set(dataByWorkspaceName, [name, entityGroup], contents);
  };

  for (const { id, name, ...workspace } of workspaces) {
    console.log(`Processing ${name}...`);
    set(dataByWorkspaceName, [name, 'data'], { id, ...workspace });
    await addEntityGroupToWorkspaceData(id, name, 'projects');
    await pause(1);
    await addEntityGroupToWorkspaceData(id, name, 'clients');
    await pause(1);
    await addEntityGroupToWorkspaceData(id, name, 'tags');
    await pause(1);
    await addEntityGroupToWorkspaceData(id, name, 'timeEntries');
  }

  await writeToJsonAsync(outputPath, dataByWorkspaceName);
  console.log('Clockify entities written to file!');
}

/**
 * Confirms that the deletion operation needs to go down, then goes buck wild.
 */
function confirmAndDeleteEntities() {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Sayonara!
  const exitProgram = () => {
    reader.close();
    process.exit();
  };

  reader.question(
    'Are you sure you want to delete all Clockify entities? This cannot be undone. (y/n): ',
    answer => {
      if (/y/gi.test(answer)) {
        deleteEntitiesInWorkspaces()
          .then(() => {
            console.log('All processing complete!');
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            return exitProgram();
          });
      } else if (/n/gi.test(answer)) {
        console.log('Operation cancelled.');
        return exitProgram();
      } else {
        console.log('Invalid entry.');
        return exitProgram();
      }
    },
  );
}

/**
 * Performs an action based on the arg passed to the script.
 * @param {string} action
 * @returns {Promise<void>}
 */
async function handleInput(action) {
  const commandsMessage = [
    '  delete',
    '      Deletes all time entries, projects, tags, and clients on Clockify',
    '  write',
    '      Grabs all the Clockify entities and writes them to "clockify.json" in CWD',
  ].join('\n');

  switch (action) {
    case 'help':
      const helpMessage = [
        'Manage entities in your test Clockify instance.',
        commandsMessage,
      ].join('\n');
      console.log(helpMessage);
      break;

    case 'delete':
      await confirmAndDeleteEntities();
      break;

    case 'write':
      await writeEntitiesToOutputFile();
      break;

    default:
      const invalidMessage = [
        'You must specify one of the following flags:',
        commandsMessage,
      ].join('\n');
      console.log(invalidMessage);
      break;
  }
}

const [action] = process.argv.slice(2);
handleInput(action);

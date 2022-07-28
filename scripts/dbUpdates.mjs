/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import { readJsonSync, writeJsonSync } from "./utilities.mjs";

const togglDbFilePath = fileURLToPath(
  new URL(path.join("db", "toggl.json"), import.meta.url),
);

function updateTasks() {
  const togglDb = readJsonSync(togglDbFilePath);

  const newTasks = [];

  for (const task of togglDb.tasks) {
    newTasks.push({
      id: task.id,
      name: task.name,
      workspace_id: task.wid,
      project_id: task.pid,
      user_id: task.uid,
      active: task.active,
      at: task.at,
      estimated_seconds: task.estimated_seconds,
      server_deleted_at: null,
      tracked_seconds: 0,
    });
  }

  togglDb.tasks = newTasks;

  writeJsonSync(togglDbFilePath, togglDb);
}

function updateTimeEntries() {
  const togglDb = readJsonSync(togglDbFilePath);

  const tagsByName = {};

  for (const tag of togglDb.tags) {
    tagsByName[tag.name] = tag.id;
  }

  const newEntries = [];

  for (const timeEntry of togglDb.timeEntries) {
    const tagIds = timeEntry.tags.map((tagName) => tagsByName[tagName]);

    newEntries.push({
      id: timeEntry.id,
      project_id: timeEntry.pid,
      task_id: timeEntry.tid,
      user_id: timeEntry.uid,
      workspace_id: 1001,
      description: timeEntry.description,
      start: timeEntry.start,
      stop: timeEntry.end,
      at: timeEntry.updated,
      server_deleted_at: null,
      duration: timeEntry.dur,
      duronly: false,
      billable: timeEntry.is_billable,
      tag_ids: tagIds,
      tags: timeEntry.tags,
    });
  }

  togglDb.timeEntries = newEntries;

  writeJsonSync(togglDbFilePath, togglDb);
}

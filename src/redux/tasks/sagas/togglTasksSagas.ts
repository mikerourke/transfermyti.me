import { isNil, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import {
  ApiError,
  fetchArray,
  fetchEmpty,
  fetchObject,
  getApiDelayForTool,
} from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import {
  projectIdToLinkedIdSelector,
  projectsByWorkspaceIdByToolNameSelector,
  targetProjectsByIdSelector,
} from "~/redux/projects/projectsSelectors";
import { userIdToLinkedIdSelector } from "~/redux/users/usersSelectors";
import { allFreeWorkspaceIdsSelector } from "~/redux/workspaces/workspacesSelectors";
import { EntityGroup, ToolName, type Project, type Task } from "~/types";
import { validStringify } from "~/utilities/textTransforms";

/**
 * Response from Toggl API for tasks.
 * @see https://developers.track.toggl.com/docs/api/tasks#response
 */
type TogglTaskResponse = {
  active: boolean;
  at: string;
  estimated_seconds: number;
  id: number;
  name: string;
  project_id: number;
  server_deleted_at: string | null;
  tracked_seconds: number;
  user_id: number | null;
  workspace_id: number;
};

/**
 * Creates new Toggl tasks that correspond to source and returns array of
 * transformed tasks.
 */
export function* createTogglTasksSaga(sourceTasks: Task[]): SagaIterator {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTasks,
    apiCreateFunc: createTogglTask,
  });
}

/**
 * Deletes all specified source tasks from Toggl.
 */
export function* deleteTogglTasksSaga(sourceTasks: Task[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTasks,
    apiDeleteFunc: deleteTogglTask,
  });
}

/**
 * Fetches all tasks in Toggl workspaces and returns the result.
 */
export function* fetchTogglTasksSaga(): SagaIterator<Task[]> {
  const allProjectsTable = yield select(
    projectsByWorkspaceIdByToolNameSelector,
  );

  const togglProjectsTable = allProjectsTable[ToolName.Toggl];

  // prettier-ignore
  const tableEntries = Object.entries(togglProjectsTable) as [string, Project[]][];

  const allFreeWorkspaceIds = yield select(allFreeWorkspaceIdsSelector);

  const allTasks: Task[] = [];

  const apiDelay = getApiDelayForTool(ToolName.Toggl);

  const freeWorkspaceIds = new Set<string>();

  for (const [workspaceId, projects] of tableEntries) {
    // Toggl tasks can't be fetched for paid workspaces. Rather than make a
    // bunch of requests that return 402, we skip them. We add it to a set
    // rather than just continue out of the loop, so we can catch fetch errors
    // as well and prevent further fetches:
    if (allFreeWorkspaceIds.includes(workspaceId)) {
      freeWorkspaceIds.add(workspaceId);
    }

    if (freeWorkspaceIds.has(workspaceId)) {
      continue;
    }

    for (const project of projects) {
      try {
        const tasks = yield call(
          fetchTogglTasksInProject,
          workspaceId,
          project.id,
        );

        allTasks.push(...tasks);
      } catch (err: AnyValid) {
        // User can't create or fetch tasks because the workspace isn't paid:
        if (err instanceof ApiError && err.statusCode === 402) {
          // We save the workspace ID, so we can _continue_ through the loop
          // rather than break, and we don't want to hit this error again for
          // the workspace in the next iteration of the loop:
          freeWorkspaceIds.add(workspaceId);
          continue;
        }
      }

      yield delay(apiDelay);
    }
  }

  return allTasks;
}

/**
 * Creates a new Toggl task.
 * @see https://developers.track.toggl.com/docs/api/tasks#post-workspaceprojecttasks
 */
function* createTogglTask(sourceTask: Task): SagaIterator<Task> {
  const projectIdToLinkedId = yield select(projectIdToLinkedIdSelector);

  const targetProjectId = propOr<string | null, Dictionary<string>, string>(
    null,
    sourceTask.projectId,
    projectIdToLinkedId,
  );

  if (isNil(targetProjectId)) {
    // prettier-ignore
    throw new Error(`Could not find target project ID for Toggl task ${sourceTask.name}`);
  }

  const targetProjectsById = yield select(targetProjectsByIdSelector);

  const targetProject = targetProjectsById[targetProjectId];

  if (isNil(targetProject)) {
    throw new Error(
      `Could not find target project for Toggl task ${sourceTask.name}`,
    );
  }

  const targetWorkspaceId = +targetProject.workspaceId;

  const body: RequestBody = {
    name: sourceTask.name,
    project_id: +targetProjectId,
    workspace_id: targetWorkspaceId,
  };

  let targetAssigneeId: number | null = null;

  const userIdToLinkedId = yield select(userIdToLinkedIdSelector);

  for (const sourceAssigneeId of sourceTask.assigneeIds) {
    const assigneeLinkedId: string | undefined =
      userIdToLinkedId[sourceAssigneeId];

    if (!isNil(assigneeLinkedId)) {
      targetAssigneeId = +assigneeLinkedId;

      break;
    }
  }

  if (targetAssigneeId !== null) {
    body.user_id = targetAssigneeId;
  }

  const togglTask = yield call(
    fetchObject,
    `/toggl/api/workspaces/${targetWorkspaceId}/projects/${targetProjectId}/tasks`,
    { method: "POST", body },
  );

  return transformFromResponse(togglTask);
}

/**
 * Deletes the specified Toggl task.
 * @see https://developers.track.toggl.com/docs/api/tasks#delete-workspaceprojecttask
 */
function* deleteTogglTask(sourceTask: Task): SagaIterator {
  const { id, projectId, workspaceId } = sourceTask;

  yield call(
    fetchEmpty,
    `/toggl/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${id}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Fetches Toggl tasks in the specified workspace.
 * @see https://developers.track.toggl.com/docs/api/tasks#get-workspaceprojecttasks
 */
function* fetchTogglTasksInProject(
  workspaceId: string,
  projectId: string,
): SagaIterator<Task[]> {
  const togglTasks: TogglTaskResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
  );

  return togglTasks.map(transformFromResponse);
}

function transformFromResponse(task: TogglTaskResponse): Task {
  return {
    id: task.id.toString(),
    name: task.name,
    estimate: convertSecondsToClockifyEstimate(task.estimated_seconds),
    projectId: task.project_id.toString(),
    assigneeIds: task.user_id ? [validStringify(task?.user_id, "")] : [],
    isActive: task.active,
    workspaceId: validStringify(task?.workspace_id, ""),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tasks,
  };
}

function convertSecondsToClockifyEstimate(seconds: number): string {
  const minutes = seconds / 60;

  if (minutes < 60) {
    return `PT${minutes}M`;
  }

  const hours = minutes / 60;

  return `PT${hours}H`;
}

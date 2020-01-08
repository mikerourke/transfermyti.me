import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, delay, select } from "redux-saga/effects";
import { CLOCKIFY_API_DELAY } from "~/constants";
import * as reduxUtils from "~/redux/reduxUtils";
import {
  projectIdToLinkedIdSelector,
  projectsByWorkspaceIdByToolNameSelector,
} from "~/projects/projectsSelectors";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";
import { TaskModel } from "~/tasks/tasksTypes";

type ClockifyTaskStatus = "ACTIVE" | "DONE";

export interface ClockifyTaskResponseModel {
  assigneeIds: string[] | null;
  estimate: string;
  id: string;
  name: string;
  projectId: string;
  status: ClockifyTaskStatus;
}

/**
 * Creates new Clockify tasks in all target workspaces and returns array of
 * transformed tasks.
 */
export function* createClockifyTasksSaga(
  sourceTasks: TaskModel[],
): SagaIterator<TaskModel[]> {
  return yield call(reduxUtils.createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTasks,
    apiCreateFunc: createClockifyTask,
  });
}

/**
 * Deletes all specified source tasks from Clockify.
 */
export function* deleteClockifyTasksSaga(
  sourceTasks: TaskModel[],
): SagaIterator {
  yield call(reduxUtils.deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTasks,
    apiDeleteFunc: deleteClockifyTask,
  });
}

/**
 * Fetches all tasks in Clockify workspaces and returns array of transformed
 * tasks.
 */
export function* fetchClockifyTasksSaga(): SagaIterator {
  return yield call(reduxUtils.fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTasksInWorkspace,
  });
}

/**
 * Creates a new Clockify task.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-post
 */
function* createClockifyTask(
  sourceTask: TaskModel,
  targetWorkspaceId: string,
): SagaIterator<TaskModel> {
  const projectIdToLinkedId = yield select(projectIdToLinkedIdSelector);
  const targetProjectId = projectIdToLinkedId[sourceTask.projectId];

  // TODO: Add assigneeIds selector.
  const assigneeIds: string[] = [];
  const taskRequest = {
    name: sourceTask.name,
    projectId: targetProjectId,
    assigneeIds,
    estimate: sourceTask.estimate,
    status: sourceTask.isActive ? "ACTIVE" : "DONE",
  };

  const clockifyTask = yield call(
    reduxUtils.fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/projects/${targetProjectId}/tasks`,
    { method: "POST", body: taskRequest },
  );

  return transformFromResponse(clockifyTask, targetWorkspaceId);
}

/**
 * Deletes the specified Clockify task.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--projects--projectId--tasks--id--delete
 * @deprecated This is part of the old API and will need to be updated as soon
 *             as the v1 endpoint is available.
 */
function* deleteClockifyTask(sourceTask: TaskModel): SagaIterator {
  const { workspaceId, projectId, id } = sourceTask;
  yield call(
    reduxUtils.fetchObject,
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify tasks in all projects in the specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-get
 */
function* fetchClockifyTasksInWorkspace(
  workspaceId: string,
): SagaIterator<TaskModel[]> {
  const projectsByWorkspaceIdByToolName = yield select(
    projectsByWorkspaceIdByToolNameSelector,
  );

  const clockifyProjects = R.pathOr(
    [],
    [ToolName.Clockify, workspaceId],
    projectsByWorkspaceIdByToolName,
  );

  const allClockifyTasks: ClockifyTaskResponseModel[] = [];

  for (const clockifyProject of clockifyProjects) {
    const { id: projectId } = clockifyProject;
    const clockifyTasks: ClockifyTaskResponseModel[] = yield call(
      reduxUtils.fetchPaginatedFromClockify,
      `/clockify/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    );
    allClockifyTasks.push(...clockifyTasks);

    yield delay(CLOCKIFY_API_DELAY);
  }

  return allClockifyTasks.map(clockifyTask =>
    transformFromResponse(clockifyTask, workspaceId),
  );
}

function transformFromResponse(
  task: ClockifyTaskResponseModel,
  workspaceId: string,
): TaskModel {
  return {
    id: task.id,
    name: task.name,
    estimate: task.estimate,
    projectId: task.projectId,
    assigneeIds: task.assigneeIds,
    isActive: task.status === "ACTIVE",
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tasks,
  };
}

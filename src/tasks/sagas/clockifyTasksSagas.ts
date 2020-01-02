import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, delay, select } from "redux-saga/effects";
import { CLOCKIFY_API_DELAY } from "~/constants";
import {
  fetchObject,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import {
  projectIdToLinkedIdSelector,
  projectsByWorkspaceIdByToolNameSelector,
} from "~/projects/projectsSelectors";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";
import { createEntitiesForTool } from "~/redux/sagaUtils/createEntitiesForTool";
import { fetchEntitiesForTool } from "~/redux/sagaUtils/fetchEntitiesForTool";
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
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-post
 */
export function* createClockifyTasksSaga(
  sourceTasks: TaskModel[],
): SagaIterator<TaskModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTasks,
    apiCreateFunc: createClockifyTask,
  });
}

/**
 * Fetches all tasks in Clockify workspaces and returns array of transformed
 * tasks.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-get
 */
export function* fetchClockifyTasksSaga(): SagaIterator {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTasksInWorkspace,
  });
}

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
    fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/projects/${targetProjectId}/tasks`,
    { method: "POST", body: taskRequest },
  );

  return transformFromResponse(clockifyTask, targetWorkspaceId);
}

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
      paginatedClockifyFetch,
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

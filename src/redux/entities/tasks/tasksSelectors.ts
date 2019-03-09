import { createSelector } from 'reselect';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import {
  getEntityRecordsByWorkspaceId,
  getTogglInclusionRecords,
} from '~/redux/utils';
import { selectTogglClientsByWorkspaceId } from '~/redux/entities/clients/clientsSelectors';
import { selectTogglProjectsById } from '~/redux/entities/projects/projectsSelectors';
import { ClientModel } from '~/types/clientsTypes';
import { EntityType, ReduxState } from '~/types/commonTypes';
import { ProjectModel } from '~/types/projectsTypes';
import { CreateTaskRequest, TaskModel } from '~/types/tasksTypes';

export const selectClockifyTasksById = createSelector(
  (state: ReduxState) => state.entities.tasks.clockify.byId,
  tasksById => tasksById,
);

export const selectTogglTasksById = createSelector(
  (state: ReduxState) => state.entities.tasks.toggl.byId,
  tasksById => tasksById,
);

const appendWorkspaceIdToTaskRecords = (
  tasksById: Record<string, TaskModel>,
  projectsById: Record<string, ProjectModel>,
): TaskModel[] =>
  Object.values(tasksById).map(taskRecord => ({
    ...taskRecord,
    workspaceId: get(projectsById, [taskRecord.projectId, 'workspaceId'], ''),
  }));

export const selectTogglTaskRecords = createSelector(
  [selectTogglTasksById, selectTogglProjectsById],
  (tasksById, projectsById): TaskModel[] =>
    appendWorkspaceIdToTaskRecords(tasksById, projectsById),
);

export const selectTogglTasksByWorkspaceId = createSelector(
  [
    selectTogglTaskRecords,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (taskRecords, timeEntriesById): Record<string, TaskModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.Task,
      taskRecords,
      timeEntriesById,
      false,
    ),
);

export const selectTogglTaskInclusionsByWorkspaceId = createSelector(
  [
    selectTogglTaskRecords,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (taskRecords, timeEntriesById): Record<string, TaskModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.Task,
      taskRecords,
      timeEntriesById,
      true,
    ),
);

const getAssigneeIdForTask = (
  workspaceId: string,
  assigneeId: string,
  clientsByWorkspaceId: Record<string, ClientModel[]>,
) => {
  const clientsInWorkspace = get(clientsByWorkspaceId, workspaceId, []);
  if (clientsInWorkspace.length === 0) return undefined;

  const correspondingClient = clientsInWorkspace.find(
    ({ id }) => id === assigneeId,
  );
  if (isNil(correspondingClient)) return undefined;

  const { linkedId } = correspondingClient;
  return isNil(linkedId) ? undefined : linkedId;
};

export const selectTasksTransferPayloadForWorkspace = createSelector(
  [
    selectTogglTaskRecords,
    selectTogglClientsByWorkspaceId,
    (_: null, workspaceId: string) => workspaceId,
  ],
  (
    togglTaskRecords,
    clientsByWorkspaceId,
    workspaceIdToGet,
  ): Record<string, CreateTaskRequest[]> => {
    const includedRecords = getTogglInclusionRecords(togglTaskRecords);
    return includedRecords.reduce(
      (acc, { workspaceId, projectId, name, estimate, assigneeId }) => {
        if (workspaceId !== workspaceIdToGet) return acc;

        return {
          ...acc,
          [projectId]: [
            ...get(acc, projectId, []),
            {
              name,
              projectId,
              estimate,
              assigneeId: getAssigneeIdForTask(
                workspaceId,
                assigneeId,
                clientsByWorkspaceId,
              ),
            },
          ],
        };
      },
      {},
    );
  },
);

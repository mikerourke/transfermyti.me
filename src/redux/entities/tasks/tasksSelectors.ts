import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { selectTogglClientsByWorkspaceFactory } from '~/redux/entities/clients/clientsSelectors';
import { selectTogglProjectsById } from '~/redux/entities/projects/projectsSelectors';
import { ClientModel } from '~/types/clientsTypes';
import { ReduxState } from '~/types/commonTypes';
import { CreateTaskRequest, TaskModel } from '~/types/tasksTypes';

export const selectClockifyTasksByWorkspace = createSelector(
  (state: ReduxState) => Object.values(state.entities.tasks.clockify.byId),
  tasks => groupByWorkspace(tasks),
);

export const selectTogglTasks = createSelector(
  (state: ReduxState) => Object.values(state.entities.tasks.clockify.byId),
  selectTogglProjectsById,
  (tasks, projectsById): TaskModel[] =>
    tasks.map(task => ({
      ...task,
      workspaceId: get(projectsById, [task.projectId, 'workspaceId'], ''),
    })),
);

export const selectToggleTasksByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglTasks,
    (tasks): Record<string, TaskModel[]> => {
      const tasksToUse = inclusionsOnly ? findTogglInclusions(tasks) : tasks;
      return groupByWorkspace(tasksToUse);
    },
  );

const findAssigneeIdForTask = (
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
  selectTogglTasks,
  selectTogglClientsByWorkspaceFactory(true),
  (tasks, clientsByWorkspaceId) => (
    workspaceIdToGet: string,
  ): Record<string, CreateTaskRequest[]> => {
    const includedTasks = findTogglInclusions(tasks);
    return includedTasks.reduce(
      (acc, { workspaceId, projectId, name, estimate, assigneeId }) => {
        if (workspaceId !== workspaceIdToGet) return acc;

        const assigneeIdForTask = findAssigneeIdForTask(
          workspaceId,
          assigneeId,
          clientsByWorkspaceId,
        );

        return {
          ...acc,
          [projectId]: [
            ...get(acc, projectId, []),
            { name, projectId, estimate, assigneeId: assigneeIdForTask },
          ],
        };
      },
      {},
    );
  },
);

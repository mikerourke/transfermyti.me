import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { selectTogglClientsByWorkspaceFactory } from '~/redux/entities/clients/clientsSelectors';
import { selectTogglProjectsById } from '~/redux/entities/projects/projectsSelectors';
import {
  CompoundClientModel,
  CompoundTaskModel,
  CreateTaskRequestModel,
  ReduxState,
} from '~/types';

export const selectTogglTasksById = createSelector(
  (state: ReduxState) => state.entities.tasks.toggl.byId,
  (tasksById): Record<string, CompoundTaskModel> => tasksById,
);

export const selectTogglTasks = createSelector(
  selectTogglTasksById,
  selectTogglProjectsById,
  (tasksById, projectsById): Array<CompoundTaskModel> =>
    Object.values(tasksById).map(task => ({
      ...task,
      workspaceId: get(projectsById, [task.projectId, 'workspaceId'], ''),
    })),
);

export const selectToggleTasksByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglTasks,
    (tasks): Record<string, Array<CompoundTaskModel>> => {
      const tasksToUse = inclusionsOnly ? findTogglInclusions(tasks) : tasks;
      return groupByWorkspace(tasksToUse);
    },
  );

const findAssigneeIdForTask = (
  workspaceId: string,
  assigneeId: string,
  clientsByWorkspaceId: Record<string, Array<CompoundClientModel>>,
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
  ): Record<string, Array<CreateTaskRequestModel>> => {
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

import { createSelector } from "reselect";
import { get, isNil } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/redux/utils";
import { selectTogglClientMatchingId } from "~/redux/entities/clients/clientsSelectors";
import { CompoundTaskModel, CreateTaskRequestModel, ReduxState } from "~/types";

export const selectTogglTasks = createSelector(
  (state: ReduxState) => Object.values(state.entities.tasks.toggl.byId),
  (tasks): Array<CompoundTaskModel> => tasks,
);

export const selectToggleTasksByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglTasks,
    (tasks): Record<string, Array<CompoundTaskModel>> => {
      const tasksToUse = inclusionsOnly ? findTogglInclusions(tasks) : tasks;

      return groupByWorkspace(tasksToUse);
    },
  );

export const selectTasksTransferPayloadForWorkspace = createSelector(
  selectToggleTasksByWorkspaceFactory(true),
  selectTogglClientMatchingId,
  (inclusionsByWorkspace, getClientMatchingId) => (
    workspaceIdToGet: string,
  ): Array<CreateTaskRequestModel> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundTaskModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce(
      (acc, { projectId, name, estimate, assigneeId }) => {
        const clientAssigneeId = getClientMatchingId(assigneeId).linkedId;
        return [
          ...acc,
          {
            name,
            projectId,
            estimate,
            assigneeId: isNil(clientAssigneeId) ? undefined : clientAssigneeId,
          },
        ];
      },
      [],
    );
  },
);

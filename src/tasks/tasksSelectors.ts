import { createSelector, Selector } from "reselect";
import { get, isNil } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/utils";
import { selectTogglClientMatchingId } from "~/clients/clientsSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ClockifyTaskModel, CompoundTaskModel } from "~/tasks/tasksTypes";
import { EntityGroupsByKey } from "~/common/commonTypes";

export const selectTogglTasks = createSelector(
  (state: ReduxState) => Object.values(state.tasks.toggl.byId),
  (tasks): Array<CompoundTaskModel> => tasks,
);

export const selectToggleTasksByWorkspaceFactory = (
  inclusionsOnly: boolean,
): Selector<ReduxState, EntityGroupsByKey<CompoundTaskModel>> =>
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
  ): Array<ClockifyTaskModel> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundTaskModel>;
    if (inclusions.length === 0) {
      return [];
    }

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

import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TaskModel, TasksByIdModel } from "~/tasks/tasksTypes";

const selectSourceTasksById = createSelector(
  (state: ReduxState) => state.tasks.source,
  (sourceTasksById): TasksByIdModel => sourceTasksById,
);

export const selectSourceTasks = createSelector(
  selectSourceTasksById,
  (sourceTasksById): TaskModel[] => Object.values(sourceTasksById),
);

export const selectSourceTasksForTransfer = createSelector(
  selectSourceTasks,
  sourceTasks =>
    sourceTasks.filter(sourceTask =>
      R.and(sourceTask.isIncluded, R.isNil(sourceTask.linkedId)),
    ),
);

export const selectSourceTasksInActiveWorkspace = createSelector(
  selectSourceTasks,
  selectActiveWorkspaceId,
  (sourceTasks, workspaceId): TaskModel[] =>
    sourceTasks.filter(task => task.workspaceId === workspaceId),
);

export const selectTargetTaskId = createSelector(
  selectSourceTasksById,
  (_: ReduxState, sourceTaskId: string | null) => sourceTaskId,
  (sourceTasksById, sourceTaskId): string | null => {
    if (sourceTaskId === null) {
      return null;
    }

    return R.pathOr<null>(null, [sourceTaskId, "linkedId"], sourceTasksById);
  },
);

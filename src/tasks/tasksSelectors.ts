import { createSelector } from "reselect";
import * as R from "ramda";
import { sourceProjectsByIdSelector } from "~/projects/projectsSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { TaskModel, TasksByIdModel, TaskTableViewModel } from "./tasksTypes";

export const sourceTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.source,
  (sourceTasksById): TasksByIdModel => sourceTasksById,
);

const targetTasksByIdSelector = createSelector(
  (state: ReduxState) => state.tasks.target,
  (targetTasksById): TasksByIdModel => targetTasksById,
);

export const sourceTasksSelector = createSelector(
  sourceTasksByIdSelector,
  (sourceTasksById): TaskModel[] => Object.values(sourceTasksById),
);

export const includedSourceTasksSelector = createSelector(
  sourceTasksSelector,
  (sourceTasks): TaskModel[] =>
    sourceTasks.filter(sourceTask => sourceTask.isIncluded),
);

export const includedSourceTasksCountSelector = createSelector(
  includedSourceTasksSelector,
  includedSourceTasks => includedSourceTasks.length,
);

export const sourceTasksForTransferSelector = createSelector(
  includedSourceTasksSelector,
  sourceTasks => sourceTasks.filter(sourceTask => R.isNil(sourceTask.linkedId)),
);

export const sourceTasksInActiveWorkspaceSelector = createSelector(
  activeWorkspaceIdSelector,
  sourceTasksSelector,
  (workspaceId, sourceTasks): TaskModel[] =>
    sourceTasks.filter(task => task.workspaceId === workspaceId),
);

export const tasksForInclusionsTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceTasksInActiveWorkspaceSelector,
  targetTasksByIdSelector,
  sourceProjectsByIdSelector,
  sourceTimeEntryCountByIdFieldSelectorFactory("taskId"),
  (
    areExistsInTargetShown,
    sourceTasks,
    targetTasksById,
    sourceProjectsById,
    timeEntryCountByTaskId,
  ): TaskTableViewModel[] =>
    sourceTasks.reduce((acc, sourceTask) => {
      const existsInTarget = sourceTask.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        return acc;
      }

      let isActiveInTarget = false;
      if (existsInTarget) {
        const targetId = sourceTask.linkedId as string;
        isActiveInTarget = targetTasksById[targetId].isActive;
      }

      const entryCount = R.propOr<number, Record<string, number>, number>(
        0,
        sourceTask.id,
        timeEntryCountByTaskId,
      );

      return [
        ...acc,
        {
          ...sourceTask,
          entryCount,
          existsInTarget,
          isActiveInSource: sourceTask.isActive,
          isActiveInTarget,
          projectName: sourceProjectsById[sourceTask.projectId].name,
        },
      ];
    }, [] as TaskTableViewModel[]),
);

export const tasksTotalCountsByTypeSelector = createSelector(
  tasksForInclusionsTableSelector,
  tasksForTableView =>
    tasksForTableView.reduce(
      (
        acc,
        {
          entryCount,
          isIncluded,
          isActiveInSource,
          isActiveInTarget,
        }: TableViewModel<TaskModel>,
      ) => ({
        entries: acc.entries + entryCount,
        activeInSource: acc.activeInSource + (isActiveInSource ? 1 : 0),
        activeInTarget: acc.activeInSource + (isActiveInTarget ? 1 : 0),
        inclusions: acc.inclusions + (isIncluded ? 1 : 0),
      }),
      {
        entries: 0,
        activeInSource: 0,
        activeInTarget: 0,
        inclusions: 0,
      },
    ),
);

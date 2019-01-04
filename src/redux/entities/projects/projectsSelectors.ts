import { createSelector } from 'reselect';
import { getEntityRecordsByWorkspaceId } from '../../utils';
import { EntityType } from '../../../types/commonTypes';
import { ProjectModel } from '../../../types/projectsTypes';
import { State } from '../../rootReducer';

export const selectClockifyProjectRecords = createSelector(
  (state: State) => state.entities.projects.clockify.projectsById,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

export const selectTogglProjectsById = createSelector(
  (state: State) => state.entities.projects.toggl.projectsById,
  projectsById => projectsById,
);

export const selectTogglProjectRecords = createSelector(
  selectTogglProjectsById,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

export const selectTogglProjectRecordsByWorkspaceId = createSelector(
  [
    selectTogglProjectRecords,
    (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  ],
  (projectRecords, timeEntriesById): Record<string, ProjectModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.Project,
      projectRecords,
      timeEntriesById,
    ),
);

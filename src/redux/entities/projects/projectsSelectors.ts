import { createSelector } from 'reselect';
import ReduxEntity from '../../../utils/ReduxEntity';
import { EntityType } from '../../../types/commonTypes';
import { ProjectModel } from '../../../types/projectsTypes';
import { State } from '../../rootReducer';

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
    ReduxEntity.getRecordsByWorkspaceId(
      EntityType.Project,
      projectRecords,
      timeEntriesById,
    ),
);

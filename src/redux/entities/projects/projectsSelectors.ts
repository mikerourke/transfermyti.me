import { createSelector } from 'reselect';
import { ProjectModel } from '../../../types/projectsTypes';
import { State } from '../../rootReducer';

export const selectTogglProjectRecords = createSelector(
  (state: State) => state.entities.projects.toggl.projectsById,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

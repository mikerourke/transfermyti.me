import { createSelector } from 'reselect';
import { WorkspaceModel } from '../../../types/workspaces';
import { State } from '../../rootReducer';

export const selectTogglWorkspaceRecords = createSelector(
  (state: State) => state.entities.workspaces.toggl.workspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

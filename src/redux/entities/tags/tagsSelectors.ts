import { createSelector } from 'reselect';
import { TagModel } from '../../../types/tagsTypes';
import { State } from '../../rootReducer';

export const selectTogglTagRecords = createSelector(
  (state: State) => state.entities.tags.toggl.tagsById,
  (tagsById): TagModel[] => Object.values(tagsById),
);

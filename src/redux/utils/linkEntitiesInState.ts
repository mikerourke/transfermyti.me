import { get, isEmpty } from 'lodash';
import { ToolName } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';

type ModelWithName<T> = T & { name: string };

/**
 * Given the specified entityGroup and entity state, link the Toggl and Clockify
 * entities by setting a value to the `linkedId` field. The link is contingent
 * on the name (for non-time entry entities) and the start time, end time, and
 * description (for time entries).
 */
export default function linkEntitiesInState<TState>(
  entityGroup: EntityGroup,
  normalizedState: TState,
): TState {
  const clockifyById = get(normalizedState, [ToolName.Clockify, 'byId'], {});
  const togglById = get(normalizedState, [ToolName.Toggl, 'byId'], {});

  if (isEmpty(clockifyById) || isEmpty(togglById)) return normalizedState;

  const linkerFunc =
    entityGroup === EntityGroup.TimeEntries
      ? linkEntitiesByTime
      : linkEntitiesByName;

  return {
    ...normalizedState,
    [ToolName.Clockify]: {
      ...get(normalizedState, ToolName.Clockify, {}),
      byId: linkerFunc(entityGroup, togglById, clockifyById),
    },
    [ToolName.Toggl]: {
      ...get(normalizedState, ToolName.Toggl, {}),
      byId: linkerFunc(entityGroup, clockifyById, togglById),
    },
  };
}

/**
 * Sets the `linkedId` field of the record in the updatedEntitiesById that is in
 * the same entityGroup and has the same `name`.
 */
function linkEntitiesByName<TModel>(
  entityGroup: EntityGroup,
  linkFromEntitiesById: Record<string, TModel>,
  updatedEntitiesById: Record<string, TModel>,
): Record<string, TModel> {
  const linkFromEntitiesByName = Object.values(linkFromEntitiesById).reduce(
    (acc, entityRecord: ModelWithName<TModel>) => ({
      ...acc,
      [entityRecord.name]: entityRecord,
    }),
    {},
  );

  return Object.entries(updatedEntitiesById).reduce(
    (acc, [entityId, entityRecord]: [string, ModelWithName<TModel>]) => ({
      ...acc,
      [entityId]: {
        ...entityRecord,
        linkedId: get(linkFromEntitiesByName, [entityRecord.name, 'id'], null),
      },
    }),
    {},
  );
}

/**
 * Sets the `linkedId` field of the time entry in the updatedEntitiesById that
 * shares the same start time, stop time, and description (+/- 5 seconds).
 */
function linkEntitiesByTime<TModel>(
  entityGroup: EntityGroup,
  linkFromEntitiesById: Record<string, TModel>,
  updatedEntitiesById: Record<string, TModel>,
): Record<string, TModel> {
  // TODO: Add this.
  return updatedEntitiesById;
}

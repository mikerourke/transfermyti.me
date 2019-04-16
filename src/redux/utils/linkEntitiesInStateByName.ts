import { get, isEmpty } from 'lodash';
import { EntityGroup, ToolName } from '~/types';

type ModelWithName<T> = T & { name: string; isIncluded?: boolean };

/**
 * Given the specified entityGroup and entity state, link the Toggl and Clockify
 * entities by setting a value to the `linkedId` field.
 */
export function linkEntitiesInStateByName<TState>(
  entityGroup: EntityGroup,
  normalizedState: TState,
): TState {
  const clockifyById = get(normalizedState, [ToolName.Clockify, 'byId'], {});
  const togglById = get(normalizedState, [ToolName.Toggl, 'byId'], {});

  if (isEmpty(clockifyById) || isEmpty(togglById)) return normalizedState;

  return {
    ...normalizedState,
    [ToolName.Clockify]: {
      ...get(normalizedState, ToolName.Clockify, {}),
      byId: linkEntitiesByName(entityGroup, togglById, clockifyById),
    },
    [ToolName.Toggl]: {
      ...get(normalizedState, ToolName.Toggl, {}),
      byId: linkEntitiesByName(entityGroup, clockifyById, togglById),
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

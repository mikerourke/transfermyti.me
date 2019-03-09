import { normalize, schema, Schema } from 'normalizr';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import uniq from 'lodash/uniq';
import { EntityGroup, ToolName } from '~/types/commonTypes';

import StrategyFunction = schema.StrategyFunction;

const getEntitySchema = (
  entityGroup: EntityGroup,
  schemaProcessStrategy: StrategyFunction,
): Schema => {
  const entitySchema = new schema.Entity(
    entityGroup,
    {},
    {
      idAttribute: value => value.id.toString(),
      processStrategy: schemaProcessStrategy,
    },
  );
  return [entitySchema];
};

const getByIdWithLinkedIds = <TModel>(
  linkFromEntitiesById: Record<string, TModel>,
  appendToEntitiesById: Record<string, TModel>,
): Record<string, TModel> => {
  if (isEmpty(linkFromEntitiesById)) return appendToEntitiesById;

  type ModelWithName<T> = T & { name: string };

  const linkFromEntitiesByName = Object.values(linkFromEntitiesById).reduce(
    (acc, entityRecord: ModelWithName<TModel>) => ({
      ...acc,
      [entityRecord.name]: entityRecord,
    }),
    {},
  );

  return Object.entries(appendToEntitiesById).reduce(
    (acc, [entityId, entityRecord]: [string, ModelWithName<TModel>]) => ({
      ...acc,
      [entityId]: {
        ...entityRecord,
        linkedId: get(linkFromEntitiesByName, [entityRecord.name, 'id'], null),
      },
    }),
    {},
  );
};

export default function getEntityNormalizedState<TState, TPayload>(
  toolName: ToolName,
  entityGroup: EntityGroup,
  schemaProcessStrategy: StrategyFunction,
  state: TState,
  payload: TPayload,
): TState {
  if (isNil(payload)) return state;

  const entitySchema = getEntitySchema(entityGroup, schemaProcessStrategy);
  const { entities, result } = normalize(payload, entitySchema);

  const normalizedState = {
    ...state,
    [toolName]: {
      ...state[toolName],
      byId: {
        ...get(state, [toolName, 'byId'], {}),
        ...entities[entityGroup],
      },
      idValues: uniq([...get(state, [toolName, 'idValues'], []), ...result]),
    },
  };

  if (toolName === ToolName.Toggl) return normalizedState;

  // Since the Clockify entities are fetched _after_ the Toggl records, we can
  // loop through each group and assign linked IDs:
  const { clockify, toggl } = normalizedState;
  return {
    ...normalizedState,
    [ToolName.Clockify]: {
      ...get(normalizedState, ToolName.Clockify, {}),
      byId: getByIdWithLinkedIds(toggl.byId, clockify.byId),
    },
    [ToolName.Toggl]: {
      ...get(normalizedState, ToolName.Toggl, {}),
      byId: getByIdWithLinkedIds(clockify.byId, toggl.byId),
    },
  };
}

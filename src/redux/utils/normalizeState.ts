import { normalize, schema, Schema } from 'normalizr';
import { get, isEmpty, isNil, uniq } from 'lodash';
import { ToolName } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import StrategyFunction = schema.StrategyFunction;

export default function normalizeState<TState, TPayload>(
  toolName: ToolName,
  entityGroup: EntityGroup,
  state: TState,
  payload: TPayload,
  schemaProcessStrategy?: StrategyFunction,
): TState {
  if (isNil(payload)) return state;
  if (Array.isArray(payload) && payload.length === 0) return state;

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
      byId: appendLinkedId(entityGroup, toggl.byId, clockify.byId),
    },
    [ToolName.Toggl]: {
      ...get(normalizedState, ToolName.Toggl, {}),
      byId: appendLinkedId(entityGroup, clockify.byId, toggl.byId),
    },
  };
}

function getEntitySchema(
  entityGroup: EntityGroup,
  schemaProcessStrategy?: StrategyFunction,
): Schema {
  const entitySchema = new schema.Entity(
    entityGroup,
    {},
    {
      idAttribute: value => value.id.toString(),
      processStrategy: schemaProcessStrategy,
    },
  );
  return [entitySchema];
}

function appendLinkedId<TModel>(
  entityGroup: EntityGroup,
  linkFromEntitiesById: Record<string, TModel>,
  appendToEntitiesById: Record<string, TModel>,
): Record<string, TModel> {
  if (
    entityGroup === EntityGroup.TimeEntries ||
    isEmpty(linkFromEntitiesById)
  ) {
    return appendToEntitiesById;
  }

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
}

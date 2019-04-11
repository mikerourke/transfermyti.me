import { get, isNil, uniq } from 'lodash';
import { normalize, schema, Schema } from 'normalizr';
import { ToolName } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';

/**
 * Applies the specified schemaProcessStrategy to the payload and returns state
 * in the form required by all entities.
 */
export function normalizeState<TState, TPayload>(
  toolName: ToolName,
  entityGroup: EntityGroup,
  state: TState,
  payload: TPayload,
  schemaProcessStrategy?: schema.StrategyFunction,
): TState {
  if (isNil(payload)) return state;
  if (Array.isArray(payload) && payload.length === 0) return state;

  const entitySchema = getEntitySchema(entityGroup, schemaProcessStrategy);
  const { entities, result } = normalize(payload, entitySchema);

  return {
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
}

/**
 * Returns the required group schema to use in the normalize() method.
 */
function getEntitySchema(
  entityGroup: EntityGroup,
  schemaProcessStrategy?: schema.StrategyFunction,
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

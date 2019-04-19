import { get, isNil, uniq } from 'lodash';
import { normalize, schema, Schema } from 'normalizr';
import { EntityGroup, ToolName } from '~/types';

interface Params<TEntityState, TPayload> {
  toolName: ToolName;
  entityGroup: EntityGroup;
  entityState: TEntityState;
  payload: TPayload;
  schemaProcessStrategy?: schema.StrategyFunction;
}

/**
 * Applies the specified schemaProcessStrategy to the payload and returns state
 * in the form required by all entities.
 */
export function normalizeState<TEntityState, TPayload>({
  toolName,
  entityGroup,
  entityState,
  payload,
  schemaProcessStrategy,
}: Params<TEntityState, TPayload>): TEntityState {
  // If for some reason the payload is null, just return original state:
  if (isNil(payload)) return entityState;

  // If the payload is an empty array, return original state:
  if (Array.isArray(payload) && payload.length === 0) return entityState;

  const entitySchema = getEntitySchema(entityGroup, schemaProcessStrategy);
  const { entities, result } = normalize(payload, entitySchema);

  return {
    ...entityState,
    [toolName]: {
      ...entityState[toolName],
      byId: {
        ...get(entityState, [toolName, 'byId'], {}),
        ...entities[entityGroup],
      },
      idValues: uniq([
        ...get(entityState, [toolName, 'idValues'], []),
        ...result,
      ]),
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

import { normalize, schema, Schema } from 'normalizr';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import uniq from 'lodash/uniq';
import getEntityGroupFromType from './getEntityGroupFromType';
import { EntityGroup, EntityType, ToolName } from '../../types/commonTypes';

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

export default function getEntityNormalizedState<TState, TPayload>(
  toolName: ToolName,
  entityType: EntityType,
  schemaProcessStrategy: StrategyFunction,
  state: TState,
  payload: TPayload,
): TState {
  if (isNil(payload)) return state;

  const entityGroup = getEntityGroupFromType(entityType);
  const entitySchema = getEntitySchema(entityGroup, schemaProcessStrategy);
  const { entities, result } = normalize(payload, entitySchema);

  const byIdField = entityGroup.concat('ById');
  const idsField = entityType.concat('Ids');

  return {
    ...state,
    [toolName]: {
      ...state[toolName],
      [byIdField]: {
        ...get(state, [toolName, byIdField], {}),
        ...entities[entityGroup],
      },
      [idsField]: uniq([...get(state, [toolName, idsField], []), ...result]),
    },
  };
}

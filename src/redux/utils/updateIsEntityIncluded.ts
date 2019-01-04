import get from 'lodash/get';
import getEntityGroupFromType from './getEntityGroupFromType';
import { EntityType } from '../../types/commonTypes';

export default function updateIsEntityIncluded<TState>(
  state: TState,
  entityType: EntityType,
  entityId: string,
): TState {
  const byIdField = getEntityGroupFromType(entityType).concat('ById');

  const entityRecord = get(state, ['toggl', byIdField, entityId], {
    isIncluded: true,
  });

  return {
    ...state,
    toggl: {
      ...get(state, 'toggl', {}),
      [byIdField]: {
        ...get(state, ['toggl', byIdField], {}),
        [entityId]: {
          ...entityRecord,
          isIncluded: !entityRecord.isIncluded,
        },
      },
    },
  };
}

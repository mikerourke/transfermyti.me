import get from 'lodash/get';
import { EntityType } from '~/types/commonTypes';

export default function updateIsEntityIncluded<TState>(
  state: TState,
  entityType: EntityType,
  entityId: string,
): TState {
  const entityRecord = get(state, ['toggl', 'byId', entityId], {
    isIncluded: true,
  });

  return {
    ...state,
    toggl: {
      ...get(state, 'toggl', {}),
      byId: {
        ...get(state, ['toggl', 'byId'], {}),
        [entityId]: {
          ...entityRecord,
          isIncluded: !entityRecord.isIncluded,
        },
      },
    },
  };
}

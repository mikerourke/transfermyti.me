import { get } from 'lodash';
import { EntityType } from '~/types/entityTypes';

export default function swapEntityInclusion<TState>(
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

import { get } from 'lodash';
import { EntityType } from '~/types';

/**
 * Switches the value of `inIncluded` for the entity record that corresponds
 * with the entityId to the opposite of its current value (I didn't want to use
 * the word "toggle" for what I feel is an obvious reason).
 */
export function flipEntityInclusion<TState>(
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

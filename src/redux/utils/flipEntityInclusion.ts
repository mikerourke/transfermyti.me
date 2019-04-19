import { get } from 'lodash';

/**
 * Switches the value of `inIncluded` for the entity record that corresponds
 * with the entityId to the opposite of its current value (I didn't want to use
 * the word "toggle" for what I feel is an obvious reason).
 */
export function flipEntityInclusion<TEntityState>(
  entityState: TEntityState,
  entityId: string,
): TEntityState {
  const entityRecord = get(entityState, ['toggl', 'byId', entityId], {
    isIncluded: true,
  });

  return {
    ...entityState,
    toggl: {
      ...get(entityState, 'toggl', {}),
      byId: {
        ...get(entityState, ['toggl', 'byId'], {}),
        [entityId]: {
          ...entityRecord,
          isIncluded: !entityRecord.isIncluded,
        },
      },
    },
  };
}

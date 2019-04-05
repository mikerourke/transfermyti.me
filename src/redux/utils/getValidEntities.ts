import { isNil } from 'lodash';

export default function getValidEntities<TEntity>(
  entityRecords?: TEntity[] | null,
) {
  if (isNil(entityRecords)) return [];

  if (Array.isArray(entityRecords) && entityRecords.length !== 0) {
    return entityRecords;
  }

  return [];
}

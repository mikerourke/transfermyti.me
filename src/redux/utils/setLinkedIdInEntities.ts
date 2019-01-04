import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

type ModelWithName<T> = T & { name: string };

export default function setLinkedIdInEntities<TModel>(
  linkFromEntitiesById: Record<string, TModel>,
  appendToEntitiesById: Record<string, TModel>,
): Record<string, TModel> {
  if (isEmpty(linkFromEntitiesById)) return appendToEntitiesById;

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

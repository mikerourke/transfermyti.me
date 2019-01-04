import { EntityGroup, EntityType } from '../../types/commonTypes';

export default function getEntityGroupFromType(entityType: EntityType) {
  const entityTypeIndex = Object.values(EntityType).indexOf(entityType);
  return Object.values(EntityGroup)[entityTypeIndex];
}

import { get, isNil } from 'lodash';
import { EntityType } from '~/types/entityTypes';

export default function findIdFieldValue(
  record: any,
  entityType: EntityType,
): string | null {
  const togglIdField = {
    [EntityType.Client]: 'cid',
    [EntityType.Project]: 'pid',
    [EntityType.Task]: 'tid',
    [EntityType.User]: 'uid',
    [EntityType.Workspace]: 'wid',
  }[entityType];

  // For Toggl entities, the record has an ID field prefixed with the letter
  // representing the entity (e.g. "wid" for workspace ID). This returns either
  // the string value or null:
  try {
    if (togglIdField in record) {
      const value = get(record, togglIdField, null);
      return isNil(value) ? null : value.toString();
    }

    // For Clockify entities, if you specified "workspace" for the entity type,
    // it would return "workspaceId":
    const fieldName = entityType.concat('Id');
    if (fieldName in record) {
      return get(record, fieldName, null);
    }

    // For Clockify Tasks, the assigneeId is the userId of the assigned user:
    if (entityType === EntityType.User && 'assigneeId' in record) {
      return get(record, 'assigneeId', null);
    }

    // For Clockify entities, there may be an entity object with an "id" field
    // (e.g. "project": { "id": "someProjectId" }):
    return get(record, [entityType, 'id'], null);
  } catch (error) {
    return null;
  }
}

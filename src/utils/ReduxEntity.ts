import { normalize, schema, Schema } from 'normalizr';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import {
  EntityGroup,
  EntityModel,
  EntityType,
  ToolName,
} from '../types/commonTypes';
import { TimeEntryModel } from '../types/timeEntriesTypes';
import StrategyFunction = schema.StrategyFunction;

export default class ReduxEntity {
  private readonly entityGroup: EntityGroup;

  public static getIdFieldValue(
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

  public static getRecordsByWorkspaceId(
    entityType: EntityType,
    entityRecords: EntityModel[],
    timeEntriesById: Record<string, TimeEntryModel & { clientId?: string }>,
  ) {
    const sortedEntityRecords = sortBy(entityRecords, record =>
      get(record, 'name', null),
    );

    const entryCountByEntityId = Object.values(timeEntriesById).reduce(
      (acc, timeEntryRecord) => {
        const idField = entityType.concat('Id');
        const entityId = get(timeEntryRecord, idField, null);
        if (!entityId) return acc;
        return {
          ...acc,
          [entityId]: get(acc, entityId, 0) + 1,
        };
      },
      {},
    );

    return sortedEntityRecords.reduce((acc, entityRecord: EntityModel) => {
      const workspaceId = get(entityRecord, 'workspaceId', null);
      if (!workspaceId) return acc;

      return {
        ...acc,
        [workspaceId]: [
          ...get(acc, workspaceId, []),
          {
            workspaceId,
            ...entityRecord,
            entryCount: get(entryCountByEntityId, entityRecord.id, 0),
          },
        ],
      };
    }, {});
  }

  constructor(
    private entityType: EntityType,
    public schemaProcessStrategy: StrategyFunction,
  ) {
    const entityTypeIndex = Object.values(EntityType).indexOf(entityType);
    this.entityGroup = Object.values(EntityGroup)[entityTypeIndex];
  }

  private get byIdField(): string {
    return this.entityGroup.concat('ById');
  }

  private get idsField(): string {
    return this.entityType.concat('Ids');
  }

  private getEntitySchema(): Schema {
    const entitySchema = new schema.Entity(
      this.entityGroup,
      {},
      {
        idAttribute: value => value.id.toString(),
        processStrategy: this.schemaProcessStrategy,
      },
    );
    return [entitySchema];
  }

  public getNormalizedState<TState, TPayload>(
    toolName: ToolName,
    state: TState,
    payload: TPayload,
  ): TState {
    if (isNil(payload)) return state;

    const entitySchema = this.getEntitySchema();
    const { entities, result } = normalize(payload, entitySchema);

    const byIdField = this.byIdField;
    const idsField = this.idsField;
    return {
      ...state,
      [toolName]: {
        ...state[toolName],
        [byIdField]: {
          ...get(state, [toolName, byIdField], {}),
          ...entities[this.entityGroup],
        },
        [idsField]: uniq([...get(state, [toolName, idsField], []), ...result]),
      },
    };
  }

  public updateIsIncluded<TState>(state: TState, entityId: string): TState {
    const byIdField = this.byIdField;

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
}

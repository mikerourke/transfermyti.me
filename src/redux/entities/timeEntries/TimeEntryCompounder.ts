import { get, isEmpty, isNil } from 'lodash';
import { findIdFieldValue } from '~/redux/utils';
import {
  CompoundClientModel,
  CompoundTimeEntryModel,
  EntitiesByGroupModel,
  EntityType,
  TimeEntryForTool,
} from '~/types';

interface ClientDetails {
  clientId: string | null;
  clientName: string | null;
}

export class TimeEntryCompounder {
  private timeEntryRecord: TimeEntryForTool;

  public constructor(
    private workspaceId: string,
    private entitiesByGroup: EntitiesByGroupModel,
  ) {}

  public compound(timeEntryRecord: TimeEntryForTool): CompoundTimeEntryModel {
    this.timeEntryRecord = timeEntryRecord;

    const projectId = findIdFieldValue(timeEntryRecord, EntityType.Project);
    const taskId = findIdFieldValue(timeEntryRecord, EntityType.Task);
    const userId = findIdFieldValue(timeEntryRecord, EntityType.User);

    return {
      id: timeEntryRecord.id.toString(),
      description: timeEntryRecord.description,
      projectId,
      taskId,
      userId,
      userGroupIds: this.findUserGroupIds(userId),
      workspaceId: this.workspaceId,
      ...this.clientDetails,
      isBillable: this.isBillable,
      start: this.startTime,
      end: this.endTime,
      tagNames: timeEntryRecord.tags,
      isActive: this.determineIfActive(projectId),
      name: null,
      linkedId: null,
      isIncluded: true,
      type: EntityType.TimeEntry,
    };
  }

  private get isBillable() {
    return 'is_billable' in this.timeEntryRecord
      ? this.timeEntryRecord.is_billable
      : get(this.timeEntryRecord, 'billable', false);
  }

  private get startTime() {
    return this.getTime('start');
  }

  private get endTime() {
    return this.getTime('end');
  }

  private getTime(field: 'start' | 'end') {
    const timeValue =
      'timeInterval' in this.timeEntryRecord
        ? get(this.timeEntryRecord, ['timeInterval', field], null)
        : get(this.timeEntryRecord, field, null);
    return isNil(timeValue) ? null : new Date(timeValue);
  }

  private determineIfActive(projectId: string) {
    return get(
      this.entitiesByGroup.projects.byId,
      [projectId, 'isActive'],
      false,
    );
  }

  private get clientDetails(): ClientDetails {
    const nullClientDetails: ClientDetails = {
      clientId: null,
      clientName: null,
    };

    const clientName = this.clientName;
    if (isNil(clientName)) {
      return nullClientDetails;
    }

    const clients = Object.values(this.entitiesByGroup.clients.byId) as Array<
      CompoundClientModel
    >;
    if (clients.length === 0) {
      return nullClientDetails;
    }

    const matchingClient = clients.find(({ name }) => name === clientName);
    if (isNil(matchingClient)) {
      return nullClientDetails;
    }

    return { clientId: matchingClient.id, clientName };
  }

  private get clientName() {
    if ('client' in this.timeEntryRecord) {
      return this.timeEntryRecord.client;
    }

    return get(this.timeEntryRecord, ['project', 'clientName'], null);
  }

  private findUserGroupIds(userId: string) {
    const usersById = this.entitiesByGroup.users.byId;
    if (isEmpty(usersById)) {
      return [];
    }

    return get(usersById, [userId, 'userGroupIds'], []);
  }
}

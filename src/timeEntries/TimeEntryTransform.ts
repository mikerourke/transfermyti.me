import { get, isEmpty, isNil } from "lodash";
import { findIdFieldValue } from "~/utils";
import { CompoundClientModel } from "~/clients/clientsTypes";
import {
  EntitiesByGroupModel,
  EntityGroup,
  EntityType,
} from "~/common/commonTypes";
import { CompoundTimeEntryModel, TimeEntryForTool } from "./timeEntriesTypes";

interface ClientDetails {
  clientId: string | null;
  clientName: string | null;
}

export class TimeEntryTransform {
  private entitiesByGroup: EntitiesByGroupModel;

  public constructor(private timeEntryRecord: TimeEntryForTool) {}

  public compound(
    workspaceId: string,
    entitiesByGroup: EntitiesByGroupModel,
  ): CompoundTimeEntryModel {
    this.entitiesByGroup = entitiesByGroup;

    const projectId = findIdFieldValue(
      this.timeEntryRecord,
      EntityType.Project,
    );
    const taskId = findIdFieldValue(this.timeEntryRecord, EntityType.Task);
    const userId = findIdFieldValue(this.timeEntryRecord, EntityType.User);
    const startTime = this.startTime;

    return {
      id: this.timeEntryRecord.id.toString(),
      description: this.timeEntryRecord.description,
      projectId,
      taskId,
      userId,
      userGroupIds: this.findUserGroupIds(userId),
      workspaceId,
      ...this.getClientDetails(),
      isBillable: this.isBillable,
      start: startTime,
      end: this.endTime,
      year: new Date(startTime).getFullYear(),
      tagNames: this.timeEntryRecord.tags,
      isActive: this.determineIfActive(projectId),
      name: null,
      linkedId: null,
      isIncluded: true,
      memberOf: EntityGroup.TimeEntries,
    };
  }

  private get isBillable(): boolean {
    return "is_billable" in this.timeEntryRecord
      ? this.timeEntryRecord.is_billable
      : get(this.timeEntryRecord, "billable", false);
  }

  private get startTime(): Date {
    return this.getTime("start");
  }

  private get endTime(): Date {
    return this.getTime("end");
  }

  private getTime(field: "start" | "end"): Date | null {
    const timeValue =
      "timeInterval" in this.timeEntryRecord
        ? get(this.timeEntryRecord, ["timeInterval", field], null)
        : get(this.timeEntryRecord, field, null);
    return isNil(timeValue) ? null : new Date(timeValue);
  }

  private determineIfActive(projectId: string): boolean {
    return get(
      this.entitiesByGroup.projects.byId,
      [projectId, "isActive"],
      false,
    );
  }

  private getClientDetails(): ClientDetails {
    const nullClientDetails: ClientDetails = {
      clientId: null,
      clientName: null,
    };

    const clientName = this.clientName;
    if (isNil(clientName)) {
      return nullClientDetails;
    }

    const clients = Object.values(
      this.entitiesByGroup.clients.byId,
    ) as CompoundClientModel[];
    if (clients.length === 0) {
      return nullClientDetails;
    }

    const matchingClient = clients.find(({ name }) => name === clientName);
    if (isNil(matchingClient)) {
      return nullClientDetails;
    }

    return { clientId: matchingClient.id, clientName };
  }

  private get clientName(): string {
    if ("client" in this.timeEntryRecord) {
      return this.timeEntryRecord.client;
    }

    return get(this.timeEntryRecord, ["project", "clientName"], null);
  }

  private findUserGroupIds(userId: string): string[] {
    const usersById = this.entitiesByGroup.users.byId;
    if (isEmpty(usersById)) {
      return [];
    }

    return get(usersById, [userId, "userGroupIds"], []);
  }
}

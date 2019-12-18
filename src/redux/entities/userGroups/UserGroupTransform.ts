import { get, isNil } from "lodash";
import {
  ClockifyUserGroupModel,
  CompoundTimeEntryModel,
  CompoundUserGroupModel,
  CompoundUserModel,
  EntityGroup,
  TogglUserGroupModel,
} from "~/types";

type UserGroupForTool = ClockifyUserGroupModel | TogglUserGroupModel;

export class UserGroupTransform {
  public constructor(private userGroupRecord: UserGroupForTool) {}

  public compound(
    workspaceId: string,
    usersByWorkspace: Record<string, Array<CompoundUserModel>>,
  ): CompoundUserGroupModel {
    const workspaceUsers = get(usersByWorkspace, workspaceId, []);

    return {
      id: this.userGroupId,
      name: this.userGroupRecord.name,
      workspaceId,
      userIds: this.getUserIds(workspaceUsers),
      entryCount: 0,
      linkedId: null,
      isIncluded: true,
      memberOf: EntityGroup.UserGroups,
    };
  }

  public appendEntryCount(
    usersById: Record<string, CompoundUserModel>,
    timeEntries: Array<CompoundTimeEntryModel>,
  ): UserGroupForTool & { entryCount: number } {
    const userGroupUserIds = this.getUserIds(Object.values(usersById));
    if (userGroupUserIds.length === 0) {
      return { ...this.userGroupRecord, entryCount: 0 };
    }

    const entryCountByUserId = this.getTimeEntryCountByUserId(timeEntries);

    const entryCountForUserGroup = userGroupUserIds.reduce((acc, userId) => {
      const matchingUser = get(usersById, userId, null);
      if (isNil(matchingUser)) {
        return acc;
      }

      return acc + get(entryCountByUserId, userId, 0);
    }, 0);

    return { ...this.userGroupRecord, entryCount: entryCountForUserGroup };
  }

  private getTimeEntryCountByUserId(
    timeEntries: Array<CompoundTimeEntryModel>,
  ): Record<string, number> {
    return timeEntries.reduce((acc, timeEntry) => {
      const userId = get(timeEntry, "userId");
      if (isNil(userId)) {
        return acc;
      }

      return {
        ...acc,
        [userId]: get(acc, userId, 0) + 1,
      };
    }, {});
  }

  private getUserIds(users: Array<CompoundUserModel>): Array<string> {
    if ("userIds" in this.userGroupRecord) {
      return this.userGroupRecord.userIds;
    }

    const usersInUserGroup = this.getUsersInUserGroup(users);
    const idsOfUsers: Array<string> = [];

    if (usersInUserGroup.length !== 0) {
      usersInUserGroup.forEach(user => {
        idsOfUsers.push(user.id);
      });
    }

    return idsOfUsers;
  }

  private getUsersInUserGroup(
    users: Array<CompoundUserModel>,
  ): Array<CompoundUserModel> {
    if (users.length === 0) {
      return [];
    }

    const userGroupId = this.userGroupId;
    return users.filter(({ userGroupIds }) =>
      userGroupIds.includes(userGroupId),
    );
  }

  private get userGroupId(): string {
    return this.userGroupRecord.id.toString();
  }
}

import { get } from 'lodash';
import { EntityType } from '~/types/entityTypes';
import {
  ClockifyUserGroupModel,
  CompoundUserGroupModel,
  TogglUserGroupModel,
} from '~/types/userGroupsTypes';
import { CompoundUserModel } from '~/types/usersTypes';

type UserGroupForTool = ClockifyUserGroupModel | TogglUserGroupModel;

export class UserGroupCompounder {
  private userGroupRecord: UserGroupForTool;

  public constructor(
    private workspaceId: string,
    private usersByWorkspace: Record<string, Array<CompoundUserModel>>,
  ) {}

  public compound(userGroupRecord: UserGroupForTool): CompoundUserGroupModel {
    this.userGroupRecord = userGroupRecord;

    return {
      id: this.userGroupId,
      name: userGroupRecord.name,
      workspaceId: this.workspaceId,
      userIds: this.userIds,
      entryCount: 0,
      linkedId: null,
      isIncluded: true,
      type: EntityType.UserGroup,
    };
  }

  private get userIds() {
    if ('userIds' in this.userGroupRecord) {
      return this.userGroupRecord.userIds;
    }

    const usersInUserGroup = this.usersInUserGroup;
    const idsOfUsers: Array<string> = [];

    if (usersInUserGroup.length !== 0) {
      usersInUserGroup.forEach(user => {
        idsOfUsers.push(user.id);
      });
    }

    return idsOfUsers;
  }

  private get usersInUserGroup() {
    const userGroupId = this.userGroupId;
    const userGroupUsers: Array<CompoundUserModel> = [];
    const workspaceUsers = get(this.usersByWorkspace, this.workspaceId, []);

    if (workspaceUsers.length !== 0) {
      workspaceUsers.forEach(workspaceUser => {
        if (workspaceUser.userGroupIds.includes(userGroupId)) {
          userGroupUsers.push(workspaceUser);
        }
      });
    }

    return userGroupUsers;
  }

  private get userGroupId() {
    return this.userGroupRecord.id.toString();
  }
}

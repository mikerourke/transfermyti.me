import type { BaseEntityModel } from "~/modules/allEntities/allEntitiesTypes";

export interface UserGroupModel extends BaseEntityModel {
  id: string;
  name: string;
  userIds: string[];
}

export type UserGroupsByIdModel = Record<string, UserGroupModel>;

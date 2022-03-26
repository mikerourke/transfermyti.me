import type { BaseEntityModel } from "~/modules/allEntities/allEntitiesTypes";

export interface UserModel extends BaseEntityModel {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean | null;
  isActive: boolean;
  userGroupIds: string[] | null;
}

export type UsersByIdModel = Record<string, UserModel>;

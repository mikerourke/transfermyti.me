import { BaseEntityModel } from "~/common/commonTypes";

export interface UserModel extends BaseEntityModel {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean | null;
  isActive: boolean;
  userGroupIds: string[] | null;
}

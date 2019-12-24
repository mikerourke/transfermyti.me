import { BaseEntityModel } from "~/common/commonTypes";

export interface ProjectModel extends BaseEntityModel {
  id: string;
  name: string;
  clientId: string;
  isBillable: boolean;
  isPublic: boolean;
  isActive: boolean;
  color: string;
  userIds: string[];
}

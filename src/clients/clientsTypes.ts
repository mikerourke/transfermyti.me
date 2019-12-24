import { BaseEntityModel } from "~/common/commonTypes";

export interface ClientModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

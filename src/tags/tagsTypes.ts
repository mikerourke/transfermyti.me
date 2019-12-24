import { BaseEntityModel } from "~/common/commonTypes";

export interface TagModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

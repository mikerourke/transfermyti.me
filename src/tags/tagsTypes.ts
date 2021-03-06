import { BaseEntityModel } from "~/allEntities/allEntitiesTypes";

export interface TagModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

export type TagsByIdModel = Record<string, TagModel>;

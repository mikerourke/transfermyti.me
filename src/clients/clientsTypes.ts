import { BaseEntityModel } from "~/allEntities/allEntitiesTypes";

export interface ClientModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

export type ClientsByIdModel = Record<string, ClientModel>;

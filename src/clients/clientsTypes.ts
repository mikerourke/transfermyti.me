import {
  BaseEntityModel,
  TableViewModel,
} from "~/allEntities/allEntitiesTypes";

export interface ClientModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

export type ClientsByIdModel = Record<string, ClientModel>;

export type ClientTableViewModel = TableViewModel<ClientModel> & {
  projectCount: number;
};

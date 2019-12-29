import { BaseEntityModel } from "~/allEntities/allEntitiesTypes";

export interface ProjectModel extends BaseEntityModel {
  id: string;
  name: string;
  clientId: string | null;
  isBillable: boolean;
  isPublic: boolean;
  isActive: boolean;
  color: string;
  userIds: string[];
}

export type ProjectsByIdModel = Record<string, ProjectModel>;

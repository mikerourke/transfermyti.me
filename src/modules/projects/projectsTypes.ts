import { BaseEntityModel } from "~/modules/allEntities/allEntitiesTypes";

export interface EstimateModel {
  estimate: number;
  type: "AUTO" | "MANUAL";
}

export interface ProjectModel extends BaseEntityModel {
  id: string;
  name: string;
  clientId: string | null;
  isBillable: boolean;
  isPublic: boolean;
  isActive: boolean;
  estimate: EstimateModel;
  color: string;
  userIds: string[];
}

export type ProjectsByIdModel = Record<string, ProjectModel>;

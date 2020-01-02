import { BaseEntityModel, Mapping } from "~/allEntities/allEntitiesTypes";

export interface WorkspaceModel extends BaseEntityModel {
  id: string;
  name: string;
  userIds?: string[];
  isAdmin: boolean | null;
}

export type WorkspacesByIdModel = Record<string, WorkspaceModel>;

export interface UpdateIncludedWorkspaceYearModel {
  mapping: Mapping;
  workspaceId: string;
  year: number;
  isIncluded: boolean;
}

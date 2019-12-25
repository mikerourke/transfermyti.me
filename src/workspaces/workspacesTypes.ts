import { BaseEntityModel, Mapping } from "~/common/commonTypes";

export interface WorkspaceModel extends BaseEntityModel {
  id: string;
  name: string;
  inclusionsByYear?: Record<string, boolean>;
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

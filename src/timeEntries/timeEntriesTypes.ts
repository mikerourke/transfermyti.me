import {
  BaseEntityModel,
  TableViewModel,
} from "~/allEntities/allEntitiesTypes";

export interface TimeEntryModel extends BaseEntityModel {
  id: string;
  description: string;
  isBillable: boolean;
  start: Date;
  end: Date;
  year: number;
  isActive: boolean;
  clientId: string | null;
  projectId: string;
  tagIds: string[];
  tagNames: string[];
  taskId: string | null;
  userId: string;
  userGroupIds: string[];
}

export type TimeEntriesByIdModel = Record<string, TimeEntryModel>;

export interface TimeEntryTableViewModel
  extends TableViewModel<TimeEntryModel> {
  taskName: string;
  projectName: string;
}

import {
  BaseEntityModel,
  TableViewModel,
} from "~/modules/allEntities/allEntitiesTypes";

export interface TimeEntryModel extends BaseEntityModel {
  id: string;
  description: string;
  isBillable: boolean;
  start: Date;
  end: Date;
  year: number;
  isActive: boolean;
  clientId: string | null;
  projectId: string | null;
  tagIds: string[];
  tagNames: string[];
  taskId: string | null;
  userId: string | null;
  userGroupIds: string[];
}

export type TimeEntriesByIdModel = Record<string, TimeEntryModel>;

export interface TimeEntryTableViewModel
  extends TableViewModel<TimeEntryModel> {
  taskName: string | null;
  projectName: string | null;
}

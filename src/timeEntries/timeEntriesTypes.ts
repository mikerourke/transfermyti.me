import { BaseEntityModel } from "~/common/commonTypes";

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

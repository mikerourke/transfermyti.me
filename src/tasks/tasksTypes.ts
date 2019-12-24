import { BaseEntityModel } from "~/common/commonTypes";

export interface TaskModel extends BaseEntityModel {
  id: string;
  name: string;
  estimate: string;
  projectId: string;
  assigneeIds: string[] | null;
  isActive: boolean;
}

import {
  BaseEntityModel,
  TableViewModel,
} from "~/allEntities/allEntitiesTypes";

export interface TaskModel extends BaseEntityModel {
  id: string;
  name: string;
  estimate: string;
  projectId: string;
  assigneeIds: string[] | null;
  isActive: boolean;
}

export type TasksByIdModel = Record<string, TaskModel>;

export type TaskTableViewModel = TableViewModel<TaskModel> & {
  projectName: string;
};

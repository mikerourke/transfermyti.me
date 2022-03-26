import type {
  BaseEntityModel,
  TableViewModel,
} from "~/modules/allEntities/allEntitiesTypes";

export interface TaskModel extends BaseEntityModel {
  id: string;
  name: string;
  estimate: string;
  projectId: string;
  assigneeIds: string[];
  isActive: boolean;
}

export type TasksByIdModel = Record<string, TaskModel>;

export type TaskTableViewModel = TableViewModel<TaskModel> & {
  projectName: string;
};

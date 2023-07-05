import { writable } from "svelte/store";

import {
  allEntitiesFlushed,
  pushAllChangesFetchStatusUpdated,
} from "~/redux/allEntities/allEntitiesActions";
import { validationFetchStatusUpdated } from "~/redux/credentials/credentialsActions";
import { dispatchAction } from "~/redux/reduxToStore";
import { FetchStatus } from "~/types";

export enum WorkflowStep {
  PickToolAction = "pick-tool-action",
  EnterApiKeys = "enter-api-keys",
  SelectWorkspaces = "select-workspaces",
  SelectInclusions = "select-inclusions",
  PerformToolAction = "perform-tool-action",
  ToolActionSuccess = "tool-action-success",
}

export const currentWorkflowStep = writable<WorkflowStep>(
  WorkflowStep.PickToolAction,
);

export function navigateToWorkflowStep(workflowStep: WorkflowStep): void {
  // prettier-ignore
  if ([WorkflowStep.PickToolAction, WorkflowStep.ToolActionSuccess].includes(workflowStep)) {
    dispatchAction(allEntitiesFlushed());
  }

  if (workflowStep !== WorkflowStep.EnterApiKeys) {
    dispatchAction(validationFetchStatusUpdated(FetchStatus.Pending));
  }

  if (workflowStep !== WorkflowStep.PerformToolAction) {
    dispatchAction(pushAllChangesFetchStatusUpdated(FetchStatus.Pending));
  }

  setTimeout(() => {
    currentWorkflowStep.set(workflowStep);
  }, 100);
}

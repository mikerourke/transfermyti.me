import { writable } from "svelte/store";

import {
  flushAllEntities,
  updatePushAllChangesFetchStatus,
} from "~/modules/allEntities/allEntitiesActions";
import { FetchStatus } from "~/modules/allEntities/allEntitiesTypes";
import { updateValidationFetchStatus } from "~/modules/credentials/credentialsActions";
import { dispatchAction } from "~/redux/reduxToStore";

export enum WorkflowStep {
  PickToolAction = "pick-tool-action",
  EnterApiKeys = "enter-api-keys",
  SelectWorkspaces = "select-workspaces",
  SelectInclusions = "select-inclusions",
  PerformToolAction = "perform-tool-action",
  ToolActionSuccess = "tool-action-success",
}

export const currentWorkflowStep = writable(WorkflowStep.PickToolAction);

export function navigateToWorkflowStep(workflowStep: WorkflowStep): void {
  // prettier-ignore
  if ([WorkflowStep.PickToolAction, WorkflowStep.ToolActionSuccess].includes(workflowStep)) {
    dispatchAction(flushAllEntities());
  }

  if (workflowStep !== WorkflowStep.EnterApiKeys) {
    dispatchAction(updateValidationFetchStatus(FetchStatus.Pending));
  }

  if (workflowStep !== WorkflowStep.PerformToolAction) {
    dispatchAction(updatePushAllChangesFetchStatus(FetchStatus.Pending));
  }

  setTimeout(() => {
    currentWorkflowStep.set(workflowStep);
  }, 100);
}

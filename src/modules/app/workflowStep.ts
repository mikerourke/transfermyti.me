import { writable } from "svelte/store";

import {
  allEntitiesFlushed,
  pushAllChangesFetchStatusChanged,
} from "~/modules/allEntities/allEntitiesActions";
import { updateValidationFetchStatus } from "~/modules/credentials/credentialsActions";
import { dispatchAction } from "~/redux/reduxToStore";
import { FetchStatus } from "~/typeDefs";

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
    dispatchAction(allEntitiesFlushed());
  }

  if (workflowStep !== WorkflowStep.EnterApiKeys) {
    dispatchAction(updateValidationFetchStatus(FetchStatus.Pending));
  }

  if (workflowStep !== WorkflowStep.PerformToolAction) {
    dispatchAction(pushAllChangesFetchStatusChanged(FetchStatus.Pending));
  }

  setTimeout(() => {
    currentWorkflowStep.set(workflowStep);
  }, 100);
}

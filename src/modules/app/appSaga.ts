import { push, LocationChangeAction } from "connected-react-router";
import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, put, select, takeEvery } from "redux-saga/effects";

import {
  flushAllEntities,
  updatePushAllChangesFetchStatus,
} from "~/modules/allEntities/allEntitiesActions";
import {
  toolNameByMappingSelector,
  totalIncludedRecordsCountSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { updateValidationFetchStatus } from "~/modules/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { sourceWorkspacesSelector } from "~/modules/workspaces/workspacesSelectors";
import { FetchStatus, Mapping, RoutePath, ToolName } from "~/typeDefs";
import { getIfDev } from "~/utilities";

export function* appSaga(): SagaIterator {
  yield all([
    takeEvery("@@router/LOCATION_CHANGE", respondToRouteChangesSaga),
    takeEvery("@@router/LOCATION_CHANGE", validateRouteChangesSaga),
  ]);
}

/**
 * This saga listens for route changes and redirects the user to the
 * appropriate route path if certain conditions aren't met. Details for each
 * condition are documented within the saga.
 */
function* respondToRouteChangesSaga(
  action: LocationChangeAction,
): SagaIterator {
  const currentPath = action.payload.location.pathname as RoutePath;
  if (
    [RoutePath.PickToolAction, RoutePath.ToolActionSuccess].includes(
      currentPath,
    )
  ) {
    yield put(flushAllEntities());
  }

  if (currentPath !== RoutePath.EnterApiKeys) {
    yield put(updateValidationFetchStatus(FetchStatus.Pending));
  }

  /* istanbul ignore else: since this is a route change, we don't care about the else condition */
  if (currentPath !== RoutePath.PerformToolAction) {
    yield put(updatePushAllChangesFetchStatus(FetchStatus.Pending));
  }
}

function* validateRouteChangesSaga(action: LocationChangeAction): SagaIterator {
  // Disable the redirect for development. I originally had it turned on, but
  // I found myself disabling it more often than not:
  /* istanbul ignore next */
  if (getIfDev()) {
    return;
  }

  const currentPath = action.payload.location.pathname as RoutePath;
  const mapping = yield select(toolNameByMappingSelector);

  /**
   * Returns true if the step associated with the _current_ path is after the
   * step associated with the stepPath.
   */
  const isPathPastStep = (stepPath: RoutePath): boolean => {
    const routePathValues = Object.values(RoutePath);
    const currentStepNumber = routePathValues.indexOf(currentPath);
    return currentStepNumber > routePathValues.indexOf(stepPath);
  };

  // If the user is currently on a step after the transfer mapping selection
  // step and both transfer mappings in state are "none", go back to the
  // transfer mapping selection to ensure the user picks a valid option:
  /* istanbul ignore else */
  if (isPathPastStep(RoutePath.PickToolAction)) {
    if (Object.values(mapping).every((mapping) => mapping === ToolName.None)) {
      yield put(push(RoutePath.PickToolAction));
      return;
    }
  }

  // If the user is currently on a step after the API key entry step and
  // the credentials in state are missing, go back to the API key entry step:
  /* istanbul ignore else */
  if (isPathPastStep(RoutePath.EnterApiKeys)) {
    const credentials = yield select(credentialsByMappingSelector);
    const areSourceInvalid = [
      credentials.source.apiKey,
      credentials.source.email,
      credentials.source.userId,
    ].some((value) => R.isNil(value));

    let areTargetInvalid = [
      credentials.target.apiKey,
      credentials.target.email,
      credentials.target.userId,
    ].some((value) => R.isNil(value));

    // If you're deleting records and the target is null, the credentials
    // are still valid:
    /* istanbul ignore else: if the target is not "none", it'll work */
    if (mapping[Mapping.Target] === ToolName.None) {
      areTargetInvalid = false;
    }

    if (areSourceInvalid || areTargetInvalid) {
      yield put(push(RoutePath.EnterApiKeys));
      return;
    }
  }

  // If the user is currently on a step after the step to select Workspace
  // inclusions, but no workspaces are present in state, go back to the
  // Workspace selection step:
  /* istanbul ignore else */
  if (isPathPastStep(RoutePath.SelectWorkspaces)) {
    const sourceWorkspaces = yield select(sourceWorkspacesSelector);
    if (sourceWorkspaces.length === 0) {
      yield put(push(RoutePath.SelectWorkspaces));
      return;
    }
  }

  /* istanbul ignore else */
  if (isPathPastStep(RoutePath.SelectInclusions)) {
    const totalIncludedCount = yield select(totalIncludedRecordsCountSelector);
    /* istanbul ignore else: since this is a route change, we don't care about the else condition */
    if (totalIncludedCount === 0) {
      yield put(push(RoutePath.SelectInclusions));
      return;
    }
  }
}

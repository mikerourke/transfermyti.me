import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import type { ActionType } from "typesafe-actions";

import {
  flushAllEntities,
  updatePushAllChangesFetchStatus,
} from "~/modules/allEntities/allEntitiesActions";
import {
  toolNameByMappingSelector,
  totalIncludedRecordsCountSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { routePathChanged } from "~/modules/app/appActions";
import { navigateToRoute } from "~/modules/app/navigateToRoute";
import { updateValidationFetchStatus } from "~/modules/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { sourceWorkspacesSelector } from "~/modules/workspaces/workspacesSelectors";
import { FetchStatus, Mapping, RoutePath, ToolName } from "~/typeDefs";
import { isDevelopmentMode } from "~/utilities/environment";

export function* appSaga(): SagaIterator {
  yield all([
    takeEvery(routePathChanged, respondToRouteChangesSaga),
    takeEvery(routePathChanged, validateRouteChangesSaga),
  ]);
}

/**
 * This saga listens for route changes and redirects the user to the
 * appropriate route path if certain conditions aren't met. Details for each
 * condition are documented within the saga.
 */
function* respondToRouteChangesSaga({
  payload: routePath,
}: ActionType<typeof routePathChanged>): SagaIterator {
  if (
    [RoutePath.PickToolAction, RoutePath.ToolActionSuccess].includes(routePath)
  ) {
    yield put(flushAllEntities());
  }

  if (routePath !== RoutePath.EnterApiKeys) {
    yield put(updateValidationFetchStatus(FetchStatus.Pending));
  }

  /* istanbul ignore else: since this is a route change, we don't care about the else condition */
  if (routePath !== RoutePath.PerformToolAction) {
    yield put(updatePushAllChangesFetchStatus(FetchStatus.Pending));
  }
}

function* validateRouteChangesSaga({
  payload: routePath,
}: ActionType<typeof routePathChanged>): SagaIterator {
  // Disable the redirect for development. I originally had it turned on, but
  // I found myself disabling it more often than not:
  /* istanbul ignore next */
  if (isDevelopmentMode()) {
    return;
  }

  const mapping = yield select(toolNameByMappingSelector);

  /**
   * Returns true if the step associated with the _current_ path is after the
   * step associated with the stepPath.
   */
  const isPathPastStep = (stepPath: RoutePath): boolean => {
    const routePathValues = Object.values(RoutePath);

    const currentStepNumber = routePathValues.indexOf(routePath);

    return currentStepNumber > routePathValues.indexOf(stepPath);
  };

  // If the user is currently on a step after the transfer mapping selection
  // step and both transfer mappings in state are "none", go back to the
  // transfer mapping selection to ensure the user picks a valid option:
  /* istanbul ignore else */
  if (isPathPastStep(RoutePath.PickToolAction)) {
    if (Object.values(mapping).every((mapping) => mapping === ToolName.None)) {
      yield call(navigateToRoute, RoutePath.PickToolAction);

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
      yield call(navigateToRoute, RoutePath.EnterApiKeys);

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
      yield call(navigateToRoute, RoutePath.SelectWorkspaces);

      return;
    }
  }

  /* istanbul ignore else */
  if (isPathPastStep(RoutePath.SelectInclusions)) {
    const totalIncludedCount = yield select(totalIncludedRecordsCountSelector);
    /* istanbul ignore else: since this is a route change, we don't care about the else condition */
    if (totalIncludedCount === 0) {
      yield call(navigateToRoute, RoutePath.SelectInclusions);

      return;
    }
  }
}

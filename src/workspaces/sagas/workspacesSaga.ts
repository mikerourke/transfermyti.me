import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/app/appSelectors";
import {
  createWorkspaces,
  fetchWorkspaces,
  updateActiveWorkspaceId,
} from "~/workspaces/workspacesActions";
import { sourceWorkspacesForTransferSelector } from "~/workspaces/workspacesSelectors";
import {
  createClockifyWorkspacesSaga,
  fetchClockifyWorkspacesSaga,
} from "./clockifyWorkspacesSagas";
import {
  createTogglWorkspacesSaga,
  fetchTogglWorkspacesSaga,
} from "./togglWorkspacesSagas";
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ToolAction } from "~/app/appTypes";
import {
  WorkspaceModel,
  WorkspacesByIdModel,
} from "~/workspaces/workspacesTypes";

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(createWorkspaces.request, createWorkspacesSaga),
    takeEvery(fetchWorkspaces.request, fetchWorkspacesSaga),
  ]);
}

function* createWorkspacesSaga(): SagaIterator {
  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyWorkspacesSaga,
      [ToolName.Toggl]: createTogglWorkspacesSaga,
    }[toolNameByMapping.target];

    const sourceWorkspaces = yield select(sourceWorkspacesForTransferSelector);
    const targetWorkspaces = yield call(createSagaByToolName, sourceWorkspaces);
    const workspaceByIdByMapping = linkEntitiesByIdByMapping<WorkspaceModel>(
      sourceWorkspaces,
      targetWorkspaces,
    );

    yield put(createWorkspaces.success(workspaceByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createWorkspaces.failure());
  }
}

function* fetchWorkspacesSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyWorkspacesSaga,
      [ToolName.Toggl]: fetchTogglWorkspacesSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceWorkspaces = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let workspaceByIdByMapping: Record<Mapping, WorkspacesByIdModel>;

    if (sourceWorkspaces.length !== 0) {
      const [firstWorkspace] = sourceWorkspaces;
      yield put(updateActiveWorkspaceId(firstWorkspace.id));
    }

    if (toolAction === ToolAction.Transfer) {
      const targetWorkspaces = yield call(fetchSagaByToolName[target]);

      workspaceByIdByMapping = linkEntitiesByIdByMapping<WorkspaceModel>(
        sourceWorkspaces,
        targetWorkspaces,
      );
    } else {
      workspaceByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceWorkspaces),
        target: {},
      };
    }

    yield put(fetchWorkspaces.success(workspaceByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchWorkspaces.failure());
  }
}

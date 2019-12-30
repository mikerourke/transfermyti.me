import { SagaIterator } from "@redux-saga/types";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { createClients, fetchClients } from "~/clients/clientsActions";
import { sourceClientsForTransferSelector } from "~/clients/clientsSelectors";
import {
  createClockifyClientsSaga,
  fetchClockifyClientsSaga,
} from "./clockifyClientsSagas";
import {
  createTogglClientsSaga,
  fetchTogglClientsSaga,
} from "./togglClientsSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { ClientModel } from "~/clients/clientsTypes";

export function* createClientsSaga(): SagaIterator {
  yield put(createClients.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyClientsSaga,
      [ToolName.Toggl]: createTogglClientsSaga,
    }[toolNameByMapping.target];

    const sourceClients = yield select(sourceClientsForTransferSelector);
    const targetClients = yield call(createSagaByToolName, sourceClients);
    const clientsByIdByMapping = linkEntitiesByIdByMapping<ClientModel>(
      sourceClients,
      targetClients,
    );

    yield put(createClients.success(clientsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClients.failure());
  }
}

export function* fetchClientsSaga(): SagaIterator {
  yield put(fetchClients.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyClientsSaga,
      [ToolName.Toggl]: fetchTogglClientsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceClients = yield call(fetchSagaByToolName[source]);
    const targetClients = yield call(fetchSagaByToolName[target]);

    const clientsByIdByMapping = linkEntitiesByIdByMapping<ClientModel>(
      sourceClients,
      targetClients,
    );

    yield put(fetchClients.success(clientsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClients.failure());
  }
}

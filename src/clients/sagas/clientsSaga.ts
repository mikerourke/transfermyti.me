import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectTransferMapping } from "~/app/appSelectors";
import { createClients, fetchClients } from "~/clients/clientsActions";
import { selectSourceClientsForTransfer } from "~/clients/clientsSelectors";
import {
  createClockifyClientsSaga,
  fetchClockifyClientsSaga,
} from "./clockifyClientsSagas";
import {
  createTogglClientsSaga,
  fetchTogglClientsSaga,
} from "./togglClientsSagas";
import { ClientModel } from "~/clients/clientsTypes";
import { ToolName } from "~/common/commonTypes";

export function* clientsSaga(): SagaIterator {
  yield all([
    takeEvery(createClients.request, createClientsSaga),
    takeEvery(fetchClients.request, fetchClientsSaga),
  ]);
}

function* createClientsSaga(): SagaIterator {
  try {
    const sourceClients = yield select(selectSourceClientsForTransfer);
    const transferMapping = yield select(selectTransferMapping);

    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyClientsSaga,
      [ToolName.Toggl]: createTogglClientsSaga,
    }[transferMapping.target];

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

function* fetchClientsSaga(): SagaIterator {
  try {
    const { source, target } = yield select(selectTransferMapping);

    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyClientsSaga,
      [ToolName.Toggl]: fetchTogglClientsSaga,
    };
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

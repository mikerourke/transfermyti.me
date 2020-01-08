import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/app/appSelectors";
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
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ToolAction } from "~/app/appTypes";
import { ClientModel, ClientsByIdModel } from "~/clients/clientsTypes";

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

    const toolAction = yield select(toolActionSelector);
    let clientsByIdByMapping: Record<Mapping, ClientsByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetClients = yield call(fetchSagaByToolName[target]);

      clientsByIdByMapping = linkEntitiesByIdByMapping<ClientModel>(
        sourceClients,
        targetClients,
      );
    } else {
      clientsByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceClients),
        target: {},
      };
    }

    yield put(fetchClients.success(clientsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClients.failure());
  }
}

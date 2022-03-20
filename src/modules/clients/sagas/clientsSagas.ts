import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { showErrorNotification } from "~/modules/app/appActions";
import * as clientsActions from "~/modules/clients/clientsActions";
import {
  includedSourceClientsSelector,
  sourceClientsForTransferSelector,
} from "~/modules/clients/clientsSelectors";
import { ClientsByIdModel, Mapping, ToolAction, ToolName } from "~/typeDefs";

import * as clockifySagas from "./clockifyClientsSagas";
import * as togglSagas from "./togglClientsSagas";

/**
 * Creates clients in the target tool based on the included clients from the
 * source tool and links them by ID.
 */
export function* createClientsSaga(): SagaIterator {
  yield put(clientsActions.createClients.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyClientsSaga,
      [ToolName.Toggl]: togglSagas.createTogglClientsSaga,
    }[toolNameByMapping.target];

    const sourceClients = yield select(sourceClientsForTransferSelector);
    const targetClients = yield call(createSagaByToolName, sourceClients);
    const clientsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceClients,
      targetClients,
    );

    yield put(clientsActions.createClients.success(clientsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(clientsActions.createClients.failure());
  }
}

/**
 * Deletes included clients from the source tool.
 */
export function* deleteClientsSaga(): SagaIterator {
  yield put(clientsActions.deleteClients.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyClientsSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglClientsSaga,
    }[toolNameByMapping.source];

    const sourceClients = yield select(includedSourceClientsSelector);
    yield call(deleteSagaByToolName, sourceClients);

    yield put(clientsActions.deleteClients.success());
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(clientsActions.deleteClients.failure());
  }
}

/**
 * Fetches clients from the source and target tools and links them by ID.
 */
export function* fetchClientsSaga(): SagaIterator {
  yield put(clientsActions.fetchClients.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyClientsSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglClientsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceClients = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let clientsByIdByMapping: Record<Mapping, ClientsByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetClients = yield call(fetchSagaByToolName[target]);

      clientsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceClients,
        targetClients,
      );
    } else {
      clientsByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceClients),
        target: {},
      };
    }

    yield put(clientsActions.fetchClients.success(clientsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(clientsActions.fetchClients.failure());
  }
}

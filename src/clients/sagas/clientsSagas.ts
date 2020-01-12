import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/allEntities/allEntitiesSelectors";
import { showFetchErrorNotification } from "~/app/appActions";
import * as clientsActions from "~/clients/clientsActions";
import {
  includedSourceClientsSelector,
  sourceClientsForTransferSelector,
} from "~/clients/clientsSelectors";
import * as clockifySagas from "./clockifyClientsSagas";
import * as togglSagas from "./togglClientsSagas";
import { ClientsByIdModel, Mapping, ToolAction, ToolName } from "~/typeDefs";

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
  } catch (err) {
    yield put(showFetchErrorNotification(err));
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
  } catch (err) {
    yield put(showFetchErrorNotification(err));
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
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(clientsActions.fetchClients.failure());
  }
}

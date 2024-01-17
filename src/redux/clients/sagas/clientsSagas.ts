import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import * as clientsActions from "~/redux/clients/clientsActions";
import {
  includedSourceClientsSelector,
  sourceClientsForTransferSelector,
} from "~/redux/clients/clientsSelectors";
import * as clockifySagas from "~/redux/clients/sagas/clockifyClientsSagas";
import * as togglSagas from "~/redux/clients/sagas/togglClientsSagas";
import { Mapping, ToolAction, ToolName, type Client } from "~/types";

/**
 * Creates clients in the target tool based on the included clients from the
 * source tool and links them by ID.
 */
export function* createClientsSaga(): SagaIterator {
  yield put(clientsActions.createClients.request());

  try {
    const { target } = yield select(toolNameByMappingSelector);

    const createSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.createClockifyClientsSaga
        : togglSagas.createTogglClientsSaga;

    const sourceClients = yield select(sourceClientsForTransferSelector);

    const targetClients = yield call(createSagaForTargetTool, sourceClients);

    const clientsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceClients,
      targetClients,
    );

    yield put(clientsActions.createClients.success(clientsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(clientsActions.createClients.failure());
  }
}

/**
 * Deletes included clients from the source tool.
 */
export function* deleteClientsSaga(): SagaIterator {
  yield put(clientsActions.deleteClients.request());

  try {
    const { source } = yield select(toolNameByMappingSelector);

    const deleteSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.deleteClockifyClientsSaga
        : togglSagas.deleteTogglClientsSaga;

    const sourceClients = yield select(includedSourceClientsSelector);

    yield call(deleteSagaForSourceTool, sourceClients);

    yield put(clientsActions.deleteClients.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(clientsActions.deleteClients.failure());
  }
}

/**
 * Fetches clients from the source and target tools and links them by ID.
 */
export function* fetchClientsSaga(): SagaIterator {
  yield put(clientsActions.fetchClients.request());

  try {
    const { source, target } = yield select(toolNameByMappingSelector);

    const fetchSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.fetchClockifyClientsSaga
        : togglSagas.fetchTogglClientsSaga;

    const sourceClients = yield call(fetchSagaForSourceTool);

    const toolAction = yield select(toolActionSelector);

    let clientsByIdByMapping: Record<Mapping, Dictionary<Client>>;

    if (toolAction === ToolAction.Transfer) {
      const fetchSagaForTargetTool =
        target === ToolName.Clockify
          ? clockifySagas.fetchClockifyClientsSaga
          : togglSagas.fetchTogglClientsSaga;

      const targetClients = yield call(fetchSagaForTargetTool);

      clientsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceClients,
        targetClients,
      );
    } else {
      clientsByIdByMapping = {
        source: indexBy(prop("id"), sourceClients),
        target: {},
      };
    }

    yield put(clientsActions.fetchClients.success(clientsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(clientsActions.fetchClients.failure());
  }
}

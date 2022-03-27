import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/modules/app/appActions";
import * as clockifySagas from "~/modules/timeEntries/sagas/clockifyTimeEntriesSagas";
import * as togglSagas from "~/modules/timeEntries/sagas/togglTimeEntriesSagas";
import * as timeEntriesActions from "~/modules/timeEntries/timeEntriesActions";
import {
  includedSourceTimeEntriesSelector,
  sourceTimeEntriesForTransferSelector,
} from "~/modules/timeEntries/timeEntriesSelectors";
import { Mapping, ToolAction, ToolName, type TimeEntry } from "~/typeDefs";

/**
 * Creates time entries in the target tool based on the included time entries
 * from the source tool and links them by criteria.
 */
export function* createTimeEntriesSaga(): SagaIterator {
  yield put(timeEntriesActions.createTimeEntries.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyTimeEntriesSaga,
      [ToolName.Toggl]: togglSagas.createTogglTimeEntriesSaga,
    }[toolNameByMapping.target];

    const sourceTimeEntries = yield select(
      sourceTimeEntriesForTransferSelector,
    );
    const targetTimeEntries = yield call(
      createSagaByToolName,
      sourceTimeEntries,
    );

    const timeEntriesByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceTimeEntries,
      targetTimeEntries,
    );

    yield put(
      timeEntriesActions.createTimeEntries.success(timeEntriesByIdByMapping),
    );
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));
    yield put(timeEntriesActions.createTimeEntries.failure());
  }
}

/**
 * Deletes included time entries from the source tool.
 */
export function* deleteTimeEntriesSaga(): SagaIterator {
  yield put(timeEntriesActions.deleteTimeEntries.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyTimeEntriesSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglTimeEntriesSaga,
    }[toolNameByMapping.source];

    const sourceTimeEntries = yield select(includedSourceTimeEntriesSelector);
    yield call(deleteSagaByToolName, sourceTimeEntries);

    yield put(timeEntriesActions.deleteTimeEntries.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));
    yield put(timeEntriesActions.deleteTimeEntries.failure());
  }
}

/**
 * Fetches time entries from the source and target tools and links them by
 * criteria.
 */
export function* fetchTimeEntriesSaga(): SagaIterator {
  yield put(timeEntriesActions.fetchTimeEntries.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyTimeEntriesSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglTimeEntriesSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    let sourceTimeEntries = yield call(fetchSagaByToolName[source]);
    sourceTimeEntries = sortTimeEntries(sourceTimeEntries);

    const toolAction = yield select(toolActionSelector);
    let timeEntriesByIdByMapping: Record<Mapping, Dictionary<TimeEntry>>;

    if (toolAction === ToolAction.Transfer) {
      let targetTimeEntries = yield call(fetchSagaByToolName[target]);
      targetTimeEntries = sortTimeEntries(targetTimeEntries);

      timeEntriesByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceTimeEntries,
        targetTimeEntries,
      );
    } else {
      timeEntriesByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceTimeEntries),
        target: {},
      };
    }

    yield put(
      timeEntriesActions.fetchTimeEntries.success(timeEntriesByIdByMapping),
    );
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));
    yield put(timeEntriesActions.fetchTimeEntries.failure());
  }
}

function sortTimeEntries(timeEntries: TimeEntry[]): TimeEntry[] {
  return timeEntries.sort((a, b) => a.start.getTime() - b.start.getTime());
}

import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import * as clockifySagas from "~/redux/timeEntries/sagas/clockifyTimeEntriesSagas";
import * as togglSagas from "~/redux/timeEntries/sagas/togglTimeEntriesSagas";
import * as timeEntriesActions from "~/redux/timeEntries/timeEntriesActions";
import {
  includedSourceTimeEntriesSelector,
  sourceTimeEntriesForTransferSelector,
} from "~/redux/timeEntries/timeEntriesSelectors";
import { Mapping, ToolAction, ToolName, type TimeEntry } from "~/types";

/**
 * Creates time entries in the target tool based on the included time entries
 * from the source tool and links them by criteria.
 */
export function* createTimeEntriesSaga(): SagaIterator {
  yield put(timeEntriesActions.createTimeEntries.request());

  try {
    const { target } = yield select(toolNameByMappingSelector);

    const createSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.createClockifyTimeEntriesSaga
        : togglSagas.createTogglTimeEntriesSaga;

    const sourceTimeEntries = yield select(
      sourceTimeEntriesForTransferSelector,
    );

    const targetTimeEntries = yield call(
      createSagaForTargetTool,
      sourceTimeEntries,
    );

    const timeEntriesByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceTimeEntries,
      targetTimeEntries,
    );

    // prettier-ignore
    yield put(timeEntriesActions.createTimeEntries.success(timeEntriesByIdByMapping));
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
    const { source } = yield select(toolNameByMappingSelector);

    const deleteSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.deleteClockifyTimeEntriesSaga
        : togglSagas.deleteTogglTimeEntriesSaga;

    const sourceTimeEntries = yield select(includedSourceTimeEntriesSelector);

    yield call(deleteSagaForSourceTool, sourceTimeEntries);

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
    const { source, target } = yield select(toolNameByMappingSelector);

    const fetchSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.fetchClockifyTimeEntriesSaga
        : togglSagas.fetchTogglTimeEntriesSaga;

    let sourceTimeEntries = yield call(fetchSagaForSourceTool);
    sourceTimeEntries = sortTimeEntries(sourceTimeEntries);

    const toolAction = yield select(toolActionSelector);

    let timeEntriesByIdByMapping: Record<Mapping, Dictionary<TimeEntry>>;

    if (toolAction === ToolAction.Transfer) {
      const fetchSagaForTargetTool =
        target === ToolName.Clockify
          ? clockifySagas.fetchClockifyTimeEntriesSaga
          : togglSagas.fetchTogglTimeEntriesSaga;

      let targetTimeEntries = yield call(fetchSagaForTargetTool);
      targetTimeEntries = sortTimeEntries(targetTimeEntries);

      timeEntriesByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceTimeEntries,
        targetTimeEntries,
      );
    } else {
      timeEntriesByIdByMapping = {
        source: indexBy(prop("id"), sourceTimeEntries),
        target: {},
      };
    }

    // prettier-ignore
    yield put(timeEntriesActions.fetchTimeEntries.success(timeEntriesByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(timeEntriesActions.fetchTimeEntries.failure());
  }
}

function sortTimeEntries(timeEntries: TimeEntry[]): TimeEntry[] {
  return timeEntries.sort((a, b) => a.start.getTime() - b.start.getTime());
}

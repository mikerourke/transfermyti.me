import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, put, select } from "redux-saga/effects";
import { ToolAction } from "~/app/appTypes";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  toolNameByMappingSelector,
  toolActionSelector,
} from "~/app/appSelectors";
import {
  createTimeEntries,
  fetchTimeEntries,
} from "~/timeEntries/timeEntriesActions";
import { sourceTimeEntriesForTransferSelector } from "~/timeEntries/timeEntriesSelectors";
import {
  createClockifyTimeEntriesSaga,
  fetchClockifyTimeEntriesSaga,
} from "./clockifyTimeEntriesSagas";
import {
  createTogglTimeEntriesSaga,
  fetchTogglTimeEntriesSaga,
} from "./togglTimeEntriesSagas";
import { ToolName, Mapping } from "~/allEntities/allEntitiesTypes";
import {
  TimeEntryModel,
  TimeEntriesByIdModel,
} from "~/timeEntries/timeEntriesTypes";

export function* createTimeEntriesSaga(): SagaIterator {
  yield put(createTimeEntries.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyTimeEntriesSaga,
      [ToolName.Toggl]: createTogglTimeEntriesSaga,
    }[toolNameByMapping.target];

    const sourceTimeEntries = yield select(
      sourceTimeEntriesForTransferSelector,
    );
    const targetTimeEntries = yield call(
      createSagaByToolName,
      sourceTimeEntries,
    );

    const timeEntriesByIdByMapping = linkEntitiesByIdByMapping<TimeEntryModel>(
      sourceTimeEntries,
      targetTimeEntries,
    );

    yield put(createTimeEntries.success(timeEntriesByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTimeEntries.failure());
  }
}

export function* fetchTimeEntriesSaga(): SagaIterator {
  yield put(fetchTimeEntries.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyTimeEntriesSaga,
      [ToolName.Toggl]: fetchTogglTimeEntriesSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    let sourceTimeEntries = yield call(fetchSagaByToolName[source]);
    sourceTimeEntries = sortTimeEntries(sourceTimeEntries);

    const toolAction = yield select(toolActionSelector);
    let timeEntriesByIdByMapping: Record<Mapping, TimeEntriesByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      let targetTimeEntries = yield call(fetchSagaByToolName[target]);
      targetTimeEntries = sortTimeEntries(targetTimeEntries);

      timeEntriesByIdByMapping = linkEntitiesByIdByMapping<TimeEntryModel>(
        sourceTimeEntries,
        targetTimeEntries,
      );
    } else {
      timeEntriesByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceTimeEntries),
        target: {},
      };
    }

    yield put(fetchTimeEntries.success(timeEntriesByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTimeEntries.failure());
  }
}

function sortTimeEntries(timeEntries: TimeEntryModel[]): TimeEntryModel[] {
  return timeEntries.sort((a, b) => a.start.getTime() - b.start.getTime());
}

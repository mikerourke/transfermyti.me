import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import differenceInMinutes from "date-fns/differenceInMinutes";
import * as R from "ramda";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolNameByMapping } from "~/app/appSelectors";
import {
  createTimeEntries,
  fetchTimeEntries,
} from "~/timeEntries/timeEntriesActions";
import { selectSourceTimeEntriesForTransfer } from "~/timeEntries/timeEntriesSelectors";
import {
  createClockifyTimeEntriesSaga,
  fetchClockifyTimeEntriesSaga,
} from "./clockifyTimeEntriesSagas";
import {
  createTogglTimeEntriesSaga,
  fetchTogglTimeEntriesSaga,
} from "./togglTimeEntriesSagas";
import { ToolName, Mapping } from "~/entities/entitiesTypes";
import {
  TimeEntryModel,
  TimeEntriesByIdModel,
} from "~/timeEntries/timeEntriesTypes";

export function* timeEntriesSaga(): Generator {
  yield all([
    takeEvery(createTimeEntries.request, createTimeEntriesSaga),
    takeEvery(fetchTimeEntries.request, fetchTimeEntriesSaga),
  ]);
}

function* createTimeEntriesSaga(): SagaIterator {
  try {
    const toolNameByMapping = yield select(selectToolNameByMapping);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyTimeEntriesSaga,
      [ToolName.Toggl]: createTogglTimeEntriesSaga,
    }[toolNameByMapping.target];

    const sourceTimeEntries = yield select(selectSourceTimeEntriesForTransfer);
    const targetTimeEntries = yield call(
      createSagaByToolName,
      sourceTimeEntries,
    );

    const timeEntriesByIdByMapping = linkTimeEntriesByIdByMapping(
      sourceTimeEntries,
      targetTimeEntries,
    );

    yield put(createTimeEntries.success(timeEntriesByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTimeEntries.failure());
  }
}

function* fetchTimeEntriesSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyTimeEntriesSaga,
      [ToolName.Toggl]: fetchTogglTimeEntriesSaga,
    };
    const { source, target } = yield select(selectToolNameByMapping);
    const sourceTimeEntries = yield call(fetchSagaByToolName[source]);
    const targetTimeEntries = yield call(fetchSagaByToolName[target]);

    const timeEntriesByIdByMapping = linkTimeEntriesByIdByMapping(
      sourceTimeEntries,
      targetTimeEntries,
    );

    yield put(fetchTimeEntries.success(timeEntriesByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTimeEntries.failure());
  }
}

function linkTimeEntriesByIdByMapping(
  sourceTimeEntries: TimeEntryModel[],
  targetTimeEntries: TimeEntryModel[],
): Record<Mapping, TimeEntriesByIdModel> {
  if (sourceTimeEntries.length === 0) {
    return {
      source: {},
      target: {},
    };
  }

  const sortByDate = R.sortBy(R.prop("start"));
  const sortedSourceEntries = sortByDate(sourceTimeEntries);
  const sortedTargetEntries = sortByDate(targetTimeEntries);

  const sourceById: TimeEntriesByIdModel = {};
  const targetById: TimeEntriesByIdModel = {};

  for (const sourceEntry of sortedSourceEntries) {
    sourceById[sourceEntry.id] = sourceEntry;

    for (const targetEntry of sortedTargetEntries) {
      targetById[targetEntry.id] = targetEntry;

      // TODO: Make sure this actually works!
      if (doTimeEntriesMatch(sourceEntry, targetEntry)) {
        sourceById[sourceEntry.id].linkedId = targetEntry.id;
        targetById[targetEntry.id].linkedId = sourceEntry.id;
      }
    }
  }

  return {
    source: sourceById,
    target: targetById,
  };
}

/**
 * Compares the two time entries and returns true if they _appear_ to match
 * based on the date, description, flags, etc.
 */
function doTimeEntriesMatch(
  sourceEntry: TimeEntryModel,
  targetEntry: TimeEntryModel,
): boolean {
  if (
    [
      sourceEntry.description !== targetEntry.description,
      sourceEntry.year !== targetEntry.year,
      sourceEntry.isActive !== targetEntry.isActive,
      sourceEntry.isBillable !== targetEntry.isBillable,
    ].some(Boolean)
  ) {
    return false;
  }

  return differenceInMinutes(sourceEntry.start, targetEntry.start) <= 1;
}

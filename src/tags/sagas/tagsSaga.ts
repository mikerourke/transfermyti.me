import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolNameByMapping } from "~/app/appSelectors";
import { createTags, fetchTags } from "~/tags/tagsActions";
import { selectSourceTagsForTransfer } from "~/tags/tagsSelectors";
import {
  createClockifyTagsSaga,
  fetchClockifyTagsSaga,
} from "./clockifyTagsSagas";
import { createTogglTagsSaga, fetchTogglTagsSaga } from "./togglTagsSagas";
import { ToolName } from "~/common/commonTypes";
import { TagModel } from "~/tags/tagsTypes";

export function* tagsSaga(): SagaIterator {
  yield all([
    takeEvery(createTags.request, createTagsSaga),
    takeEvery(fetchTags.request, fetchTagsSaga),
  ]);
}

function* createTagsSaga(): SagaIterator {
  try {
    const toolNameByMapping = yield select(selectToolNameByMapping);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyTagsSaga,
      [ToolName.Toggl]: createTogglTagsSaga,
    }[toolNameByMapping.target];

    const sourceTags = yield select(selectSourceTagsForTransfer);
    const targetTags = yield call(createSagaByToolName, sourceTags);
    const tagsByIdByMapping = linkEntitiesByIdByMapping<TagModel>(
      sourceTags,
      targetTags,
    );

    yield put(createTags.success(tagsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTags.failure());
  }
}

function* fetchTagsSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyTagsSaga,
      [ToolName.Toggl]: fetchTogglTagsSaga,
    };
    const { source, target } = yield select(selectToolNameByMapping);
    const sourceTags = yield call(fetchSagaByToolName[source]);
    const targetTags = yield call(fetchSagaByToolName[target]);

    const tagsByIdByMapping = linkEntitiesByIdByMapping<TagModel>(
      sourceTags,
      targetTags,
    );

    yield put(fetchTags.success(tagsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTags.failure());
  }
}

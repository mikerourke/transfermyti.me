import { SagaIterator } from "@redux-saga/types";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { createTags, fetchTags } from "~/tags/tagsActions";
import { sourceTagsForTransferSelector } from "~/tags/tagsSelectors";
import {
  createClockifyTagsSaga,
  fetchClockifyTagsSaga,
} from "./clockifyTagsSagas";
import { createTogglTagsSaga, fetchTogglTagsSaga } from "./togglTagsSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { TagModel } from "~/tags/tagsTypes";

export function* createTagsSaga(): SagaIterator {
  yield put(createTags.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyTagsSaga,
      [ToolName.Toggl]: createTogglTagsSaga,
    }[toolNameByMapping.target];

    const sourceTags = yield select(sourceTagsForTransferSelector);
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

export function* fetchTagsSaga(): SagaIterator {
  yield put(fetchTags.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyTagsSaga,
      [ToolName.Toggl]: fetchTogglTagsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
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

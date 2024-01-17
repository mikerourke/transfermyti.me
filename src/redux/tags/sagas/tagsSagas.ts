import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import * as clockifySagas from "~/redux/tags/sagas/clockifyTagsSagas";
import * as togglSagas from "~/redux/tags/sagas/togglTagsSagas";
import * as tagsActions from "~/redux/tags/tagsActions";
import {
  includedSourceTagsSelector,
  sourceTagsForTransferSelector,
} from "~/redux/tags/tagsSelectors";
import { Mapping, ToolAction, ToolName, type Tag } from "~/types";

/**
 * Creates tags in the target tool based on the included tags from the
 * source tool and links them by ID.
 */
export function* createTagsSaga(): SagaIterator {
  yield put(tagsActions.createTags.request());

  try {
    const { target } = yield select(toolNameByMappingSelector);

    const createSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.createClockifyTagsSaga
        : togglSagas.createTogglTagsSaga;

    const sourceTags = yield select(sourceTagsForTransferSelector);

    const targetTags = yield call(createSagaForTargetTool, sourceTags);

    const tagsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceTags,
      targetTags,
    );

    yield put(tagsActions.createTags.success(tagsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(tagsActions.createTags.failure());
  }
}

/**
 * Deletes included tags from the source tool.
 */
export function* deleteTagsSaga(): SagaIterator {
  yield put(tagsActions.deleteTags.request());

  try {
    const { source } = yield select(toolNameByMappingSelector);

    const deleteSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.deleteClockifyTagsSaga
        : togglSagas.deleteTogglTagsSaga;

    const sourceTags = yield select(includedSourceTagsSelector);

    yield call(deleteSagaForSourceTool, sourceTags);

    yield put(tagsActions.deleteTags.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(tagsActions.deleteTags.failure());
  }
}

/**
 * Fetches tags from the source and target tools and links them by ID.
 */
export function* fetchTagsSaga(): SagaIterator {
  yield put(tagsActions.fetchTags.request());

  try {
    const { source, target } = yield select(toolNameByMappingSelector);

    const fetchSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.fetchClockifyTagsSaga
        : togglSagas.fetchTogglTagsSaga;

    const sourceTags = yield call(fetchSagaForSourceTool);

    const toolAction = yield select(toolActionSelector);

    let tagsByIdByMapping: Record<Mapping, Dictionary<Tag>>;

    if (toolAction === ToolAction.Transfer) {
      const fetchSagaForTargetTool =
        target === ToolName.Clockify
          ? clockifySagas.fetchClockifyTagsSaga
          : togglSagas.fetchTogglTagsSaga;

      const targetTags = yield call(fetchSagaForTargetTool);

      tagsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceTags,
        targetTags,
      );
    } else {
      tagsByIdByMapping = {
        source: indexBy(prop("id"), sourceTags),
        target: {},
      };
    }

    yield put(tagsActions.fetchTags.success(tagsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(tagsActions.fetchTags.failure());
  }
}

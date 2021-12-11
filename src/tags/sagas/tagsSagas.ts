import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/allEntities/allEntitiesSelectors";
import { showErrorNotification } from "~/app/appActions";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import * as tagsActions from "~/tags/tagsActions";
import {
  includedSourceTagsSelector,
  sourceTagsForTransferSelector,
} from "~/tags/tagsSelectors";
import { Mapping, TagsByIdModel, ToolAction, ToolName } from "~/typeDefs";

import * as clockifySagas from "./clockifyTagsSagas";
import * as togglSagas from "./togglTagsSagas";

/**
 * Creates tags in the target tool based on the included tags from the
 * source tool and links them by ID.
 */
export function* createTagsSaga(): SagaIterator {
  yield put(tagsActions.createTags.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyTagsSaga,
      [ToolName.Toggl]: togglSagas.createTogglTagsSaga,
    }[toolNameByMapping.target];

    const sourceTags = yield select(sourceTagsForTransferSelector);
    const targetTags = yield call(createSagaByToolName, sourceTags);
    const tagsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceTags,
      targetTags,
    );

    yield put(tagsActions.createTags.success(tagsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(tagsActions.createTags.failure());
  }
}

/**
 * Deletes included tags from the source tool.
 */
export function* deleteTagsSaga(): SagaIterator {
  yield put(tagsActions.deleteTags.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyTagsSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglTagsSaga,
    }[toolNameByMapping.source];

    const sourceTags = yield select(includedSourceTagsSelector);
    yield call(deleteSagaByToolName, sourceTags);

    yield put(tagsActions.deleteTags.success());
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(tagsActions.deleteTags.failure());
  }
}

/**
 * Fetches tags from the source and target tools and links them by ID.
 */
export function* fetchTagsSaga(): SagaIterator {
  yield put(tagsActions.fetchTags.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyTagsSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglTagsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceTags = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let tagsByIdByMapping: Record<Mapping, TagsByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetTags = yield call(fetchSagaByToolName[target]);

      tagsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceTags,
        targetTags,
      );
    } else {
      tagsByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceTags),
        target: {},
      };
    }

    yield put(tagsActions.fetchTags.success(tagsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(tagsActions.fetchTags.failure());
  }
}

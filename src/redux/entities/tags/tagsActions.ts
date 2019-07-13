import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { batchClockifyTransferRequests } from "~/redux/utils";
import {
  apiCreateClockifyTag,
  apiFetchClockifyTags,
  apiFetchTogglTags,
} from "~/redux/entities/api/tags";
import { showFetchErrorNotification } from "~/redux/app/appActions";
import { selectTagsTransferPayloadForWorkspace } from "./tagsSelectors";
import {
  ClockifyTagModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  ReduxDispatch,
  ReduxGetState,
  TogglTagModel,
} from "~/types";

export const clockifyTagsFetch = createAsyncAction(
  "@tags/CLOCKIFY_FETCH_REQUEST",
  "@tags/CLOCKIFY_FETCH_SUCCESS",
  "@tags/CLOCKIFY_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyTagModel>, void>();

export const togglTagsFetch = createAsyncAction(
  "@tags/TOGGL_FETCH_REQUEST",
  "@tags/TOGGL_FETCH_SUCCESS",
  "@tags/TOGGL_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<TogglTagModel>, void>();

export const clockifyTagsTransfer = createAsyncAction(
  "@tags/CLOCKIFY_TRANSFER_REQUEST",
  "@tags/CLOCKIFY_TRANSFER_SUCCESS",
  "@tags/CLOCKIFY_TRANSFER_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyTagModel>, void>();

export const flipIsTagIncluded = createStandardAction("@tags/FLIP_IS_INCLUDED")<
  string
>();

export const fetchClockifyTags = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyTagsFetch.request());

  try {
    const tags = await apiFetchClockifyTags(workspaceId);

    return dispatch(
      clockifyTagsFetch.success({ entityRecords: tags, workspaceId }),
    );
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsFetch.failure());
  }
};

export const fetchTogglTags = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglTagsFetch.request());

  try {
    const tags = await apiFetchTogglTags(workspaceId);

    return dispatch(
      togglTagsFetch.success({ entityRecords: tags, workspaceId }),
    );
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTagsFetch.failure());
  }
};

export const transferTagsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const tagsInWorkspace = selectTagsTransferPayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  if (tagsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyTagsTransfer.request());

  try {
    const tags = await batchClockifyTransferRequests({
      requestsPerSecond: 4,
      dispatch,
      entityGroup: EntityGroup.Tags,
      entityRecordsInWorkspace: tagsInWorkspace,
      apiFunc: apiCreateClockifyTag,
      clockifyWorkspaceId,
      togglWorkspaceId,
    });

    return dispatch(
      clockifyTagsTransfer.success({
        entityRecords: tags,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsTransfer.failure());
  }
};

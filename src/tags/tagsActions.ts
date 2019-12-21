import { createAsyncAction, createAction } from "typesafe-actions";
import { batchClockifyTransferRequests, paginatedFetch } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  apiCreateClockifyTag,
  apiFetchClockifyTags,
  apiFetchTogglTags,
} from "./tagsApi";
import { selectTagsTransferPayloadForWorkspace } from "./tagsSelectors";
import { EntitiesFetchPayloadModel, EntityGroup } from "~/common/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { ClockifyTagModel, TogglTagModel } from "./tagsTypes";

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

export const flipIsTagIncluded = createAction("@tags/FLIP_IS_INCLUDED")<
  string
>();

export const fetchClockifyTags = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyTagsFetch.request());

  try {
    const tags = await paginatedFetch({
      apiFetchFunc: apiFetchClockifyTags,
      funcArgs: [workspaceId],
    });
    dispatch(clockifyTagsFetch.success({ entityRecords: tags, workspaceId }));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyTagsFetch.failure());
  }
};

export const fetchTogglTags = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglTagsFetch.request());

  try {
    const tags = await apiFetchTogglTags(workspaceId);
    dispatch(togglTagsFetch.success({ entityRecords: tags, workspaceId }));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglTagsFetch.failure());
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
  if (tagsInWorkspace.length === 0) {
    return;
  }

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

    dispatch(
      clockifyTagsTransfer.success({
        entityRecords: tags,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyTagsTransfer.failure());
  }
};

import { createAction, createAsyncAction } from "typesafe-actions";

import type {
  EntityGroup,
  FetchStatus,
  ToolAction,
  ToolNameByMapping,
} from "~/typeDefs";

export const createAllEntities = createAsyncAction(
  "@allEntities/createAllEntitiesRequest",
  "@allEntities/createAllEntitiesSuccess",
  "@allEntities/createAllEntitiesFailure",
)<undefined, undefined, undefined>();

export const deleteAllEntities = createAsyncAction(
  "@allEntities/deleteAllEntitiesRequest",
  "@allEntities/deleteAllEntitiesSuccess",
  "@allEntities/deleteAllEntitiesFailure",
)<undefined, undefined, undefined>();

export const fetchAllEntities = createAsyncAction(
  "@allEntities/fetchAllEntitiesRequest",
  "@allEntities/fetchAllEntitiesSuccess",
  "@allEntities/fetchAllEntitiesFailure",
)<undefined, undefined, undefined>();

export const toolActionUpdated = createAction(
  "@allEntities/toolActionUpdated",
)<ToolAction>();

export const toolNameByMappingUpdated = createAction(
  "@allEntities/toolNameByMappingUpdated",
)<ToolNameByMapping>();

export const allEntitiesFlushed = createAction(
  "@allEntities/allEntitiesFlushed",
)<undefined>();

export const isExistsInTargetShownToggled = createAction(
  "@allEntities/isExistsInTargetShownToggled",
)<undefined>();

export const fetchAllFetchStatusUpdated = createAction(
  "@allEntities/fetchAllFetchStatusUpdated",
)<FetchStatus>();

export const pushAllChangesFetchStatusUpdated = createAction(
  "@allEntities/pushAllChangesFetchStatusUpdated",
)<FetchStatus>();

export const entityGroupInProcessUpdated = createAction(
  "@allEntities/entityGroupInProcessUpdated",
)<EntityGroup | null>();

export const transferCountsByEntityGroupReset = createAction(
  "@allEntities/transferCountsByEntityGroupReset",
)<undefined>();

export const entityGroupTransferCompletedCountIncremented = createAction(
  "@allEntities/entityGroupTransferCompletedCountIncremented",
)<EntityGroup>();

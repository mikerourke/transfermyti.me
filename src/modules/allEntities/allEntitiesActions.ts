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

export const toolActionChanged = createAction(
  "@allEntities/toolActionChanged",
)<ToolAction>();

export const toolNameByMappingChanged = createAction(
  "@allEntities/toolNameByMappingChanged",
)<ToolNameByMapping>();

export const allEntitiesFlushed = createAction(
  "@allEntities/allEntitiesFlushed",
)<undefined>();

export const isExistsInTargetShownToggled = createAction(
  "@allEntities/isExistsInTargetShownToggled",
)<undefined>();

export const fetchAllFetchStatusChanged = createAction(
  "@allEntities/fetchAllFetchStatusChanged",
)<FetchStatus>();

export const pushAllChangesFetchStatusChanged = createAction(
  "@allEntities/pushAllChangesFetchStatusChanged",
)<FetchStatus>();

export const entityGroupInProcessChanged = createAction(
  "@allEntities/entityGroupInProcessChanged",
)<EntityGroup | null>();

export const transferCountsByEntityGroupReset = createAction(
  "@allEntities/transferCountsByEntityGroupReset",
)<undefined>();

export const entityGroupTransferCompletedCountIncremented = createAction(
  "@allEntities/entityGroupTransferCompletedCountIncremented",
)<EntityGroup>();

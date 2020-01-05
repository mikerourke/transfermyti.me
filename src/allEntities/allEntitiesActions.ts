import { createAction, createAsyncAction } from "typesafe-actions";
import { EntityGroup, CountsByEntityGroupModel } from "./allEntitiesTypes";

export const createAllEntities = createAsyncAction(
  "@allEntities/CREATE_ALL_ENTITIES_REQUEST",
  "@allEntities/CREATE_ALL_ENTITIES_SUCCESS",
  "@allEntities/CREATE_ALL_ENTITIES_FAILURE",
)<void, void, void>();

export const fetchAllEntities = createAsyncAction(
  "@allEntities/FETCH_ALL_ENTITIES_REQUEST",
  "@allEntities/FETCH_ALL_ENTITIES_SUCCESS",
  "@allEntities/FETCH_ALL_ENTITIES_FAILURE",
)<void, void, void>();

export const flipIfExistsInTargetShown = createAction(
  "@allEntities/FLIP_IF_EXISTS_IN_TARGET_SHOWN",
)<void>();

export const updateEntityGroupInProcess = createAction(
  "@allEntities/UPDATE_ENTITY_GROUP_IN_PROCESS",
)<EntityGroup | null>();

export const updateLastFetchTime = createAction(
  "@allEntities/UPDATE_LAST_FETCH_TIME",
)<Date | null>();

export const resetTransferCountsByEntityGroup = createAction(
  "@allEntities/RESET_TRANSFER_COUNTS_BY_ENTITY_GROUP",
)<void>();

export const updateTransferCountsByEntityGroup = createAction(
  "@allEntities/UPDATE_TRANSFER_COUNTS_BY_ENTITY_GROUP",
)<CountsByEntityGroupModel>();

export const incrementEntityGroupTransferCompletedCount = createAction(
  "@allEntities/INCREMENT_ENTITY_GROUP_TRANSFER_COMPLETED_COUNT",
)<EntityGroup>();

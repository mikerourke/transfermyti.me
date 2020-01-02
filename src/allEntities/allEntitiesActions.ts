import { createAsyncAction, createAction } from "typesafe-actions";
import { EntityGroup } from "./allEntitiesTypes";

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

export const updateEntityGroupInProcess = createAction(
  "@allEntities/UPDATE_ENTITY_GROUP_IN_PROCESS",
)<EntityGroup | null>();

export const updateLastFetchTime = createAction(
  "@allEntities/UPDATE_LAST_FETCH_TIME",
)<Date | null>();

export const updateEntityGroupTransferCountTotal = createAction(
  "@allEntities/UPDATE_ENTITY_GROUP_TRANSFER_COUNT_TOTAL",
)<{ entityGroup: EntityGroup; countTotal: number }>();

export const incrementEntityGroupTransferCountComplete = createAction(
  "@allEntities/INCREMENT_ENTITY_GROUP_TRANSFER_COUNT_COMPLETE",
)<EntityGroup>();

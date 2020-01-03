import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { ClientsByIdModel } from "./clientsTypes";

export const createClients = createAsyncAction(
  "@clients/CREATE_CLIENTS_IN_WORKSPACE_REQUEST",
  "@clients/CREATE_CLIENTS_IN_WORKSPACE_SUCCESS",
  "@clients/CREATE_CLIENTS_IN_WORKSPACE_FAILURE",
)<void, Record<Mapping, ClientsByIdModel>, void>();

export const fetchClients = createAsyncAction(
  "@clients/FETCH_CLIENTS_IN_WORKSPACE_REQUEST",
  "@clients/FETCH_CLIENTS_IN_WORKSPACE_SUCCESS",
  "@clients/FETCH_CLIENTS_IN_WORKSPACE_FAILURE",
)<void, Record<Mapping, ClientsByIdModel>, void>();

export const pushUpdatesToClients = createAction(
  "@clients/PUSH_UPDATES_TO_CLIENTS",
)<Record<Mapping, ClientsByIdModel>>();

export const flipIsClientIncluded = createAction("@clients/FLIP_IS_INCLUDED")<
  string
>();

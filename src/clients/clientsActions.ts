import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel } from "~/common/commonTypes";
import { ClientModel } from "./clientsTypes";

export const createClockifyClients = createAsyncAction(
  "@clients/CREATE_CLOCKIFY_CLIENTS_REQUEST",
  "@clients/CREATE_CLOCKIFY_CLIENTS_SUCCESS",
  "@clients/CREATE_CLOCKIFY_CLIENTS_FAILURE",
)<string, void, void>();

export const createTogglClients = createAsyncAction(
  "@clients/CREATE_TOGGL_CLIENTS_REQUEST",
  "@clients/CREATE_TOGGL_CLIENTS_SUCCESS",
  "@clients/CREATE_TOGGL_CLIENTS_FAILURE",
)<string, void, void>();

export const fetchClockifyClients = createAsyncAction(
  "@clients/FETCH_CLOCKIFY_CLIENTS_REQUEST",
  "@clients/FETCH_CLOCKIFY_CLIENTS_SUCCESS",
  "@clients/FETCH_CLOCKIFY_CLIENTS_FAILURE",
)<string, MappedEntityRecordsModel<ClientModel>, void>();

export const fetchTogglClients = createAsyncAction(
  "@clients/FETCH_TOGGL_CLIENTS_REQUEST",
  "@clients/FETCH_TOGGL_CLIENTS_SUCCESS",
  "@clients/FETCH_TOGGL_CLIENTS_FAILURE",
)<string, MappedEntityRecordsModel<ClientModel>, void>();

export const flipIsClientIncluded = createAction("@clients/FLIP_IS_INCLUDED")<
  string
>();

import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { ClientsByIdModel } from "./clientsTypes";

export const createClients = createAsyncAction(
  "@clients/CREATE_CLIENTS_REQUEST",
  "@clients/CREATE_CLIENTS_SUCCESS",
  "@clients/CREATE_CLIENTS_FAILURE",
)<void, Record<Mapping, ClientsByIdModel>, void>();

export const fetchClients = createAsyncAction(
  "@clients/FETCH_CLIENTS_REQUEST",
  "@clients/FETCH_CLIENTS_SUCCESS",
  "@clients/FETCH_CLIENTS_FAILURE",
)<void, Record<Mapping, ClientsByIdModel>, void>();

export const updateIfAllClientsIncluded = createAction(
  "@clients/UPDATE_IF_ALL_INCLUDED",
)<boolean>();

export const flipIsClientIncluded = createAction("@clients/FLIP_IS_INCLUDED")<
  string
>();

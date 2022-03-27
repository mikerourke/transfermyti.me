import { createAction, createAsyncAction } from "typesafe-actions";

import type { Client, Mapping } from "~/typeDefs";

export const createClients = createAsyncAction(
  "@clients/CREATE_CLIENTS_REQUEST",
  "@clients/CREATE_CLIENTS_SUCCESS",
  "@clients/CREATE_CLIENTS_FAILURE",
)<void, Record<Mapping, Dictionary<Client>>, void>();

export const deleteClients = createAsyncAction(
  "@clients/DELETE_CLIENTS_REQUEST",
  "@clients/DELETE_CLIENTS_SUCCESS",
  "@clients/DELETE_CLIENTS_FAILURE",
)<void, void, void>();

export const fetchClients = createAsyncAction(
  "@clients/FETCH_CLIENTS_REQUEST",
  "@clients/FETCH_CLIENTS_SUCCESS",
  "@clients/FETCH_CLIENTS_FAILURE",
)<void, Record<Mapping, Dictionary<Client>>, void>();

export const flipIsClientIncluded = createAction(
  "@clients/FLIP_IS_INCLUDED",
)<string>();

export const updateAreAllClientsIncluded = createAction(
  "@clients/UPDATE_ARE_ALL_INCLUDED",
)<boolean>();

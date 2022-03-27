import { createAction, createAsyncAction } from "typesafe-actions";

import type { Client, Mapping } from "~/typeDefs";

export const createClients = createAsyncAction(
  "@clients/createClientsRequest",
  "@clients/createClientsSuccess",
  "@clients/createClientsFailure",
)<undefined, Record<Mapping, Dictionary<Client>>, undefined>();

export const deleteClients = createAsyncAction(
  "@clients/deleteClientsRequest",
  "@clients/deleteClientsSuccess",
  "@clients/deleteClientsFailure",
)<undefined, undefined, undefined>();

export const fetchClients = createAsyncAction(
  "@clients/fetchClientsRequest",
  "@clients/fetchClientsSuccess",
  "@clients/fetchClientsFailure",
)<undefined, Record<Mapping, Dictionary<Client>>, undefined>();

export const isClientIncludedToggled = createAction(
  "@clients/isClientIncludedToggled",
)<string>();

export const areAllClientsIncludedUpdated = createAction(
  "@clients/areAllClientsIncludedUpdated",
)<boolean>();

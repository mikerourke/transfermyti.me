import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Client, Mapping } from "~/typeDefs";

export const areAllClientsIncludedUpdated = createAction<boolean>(
  "@clients/areAllClientsIncludedUpdated",
);

export const isClientIncludedToggled = createAction<string>(
  "@clients/isClientIncludedToggled",
);

export const createClients = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Client>>,
  undefined
>("@clients/createClients");

export const deleteClients = createAsyncAction<undefined, undefined, undefined>(
  "@clients/deleteClients",
);

export const fetchClients = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Client>>,
  undefined
>("@clients/fetchClients");

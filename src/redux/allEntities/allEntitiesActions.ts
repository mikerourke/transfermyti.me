import { createAction, createAsyncAction } from "~/redux/reduxTools";

import type {
  EntityGroup,
  FetchStatus,
  ToolAction,
  ToolNameByMapping,
} from "~/typeDefs";

export const allEntitiesFlushed = createAction<undefined>(
  "@allEntities/allEntitiesFlushed",
);

export const entityGroupInProcessUpdated = createAction<EntityGroup | null>(
  "@allEntities/entityGroupInProcessUpdated",
);

export const entityGroupTransferCompletedCountIncremented =
  createAction<EntityGroup>(
    "@allEntities/entityGroupTransferCompletedCountIncremented",
  );

export const fetchAllFetchStatusUpdated = createAction<FetchStatus>(
  "@allEntities/fetchAllFetchStatusUpdated",
);

export const isExistsInTargetShownToggled = createAction<undefined>(
  "@allEntities/isExistsInTargetShownToggled",
);

export const pushAllChangesFetchStatusUpdated = createAction<FetchStatus>(
  "@allEntities/pushAllChangesFetchStatusUpdated",
);

export const toolActionUpdated = createAction<ToolAction>(
  "@allEntities/toolActionUpdated",
);

export const toolNameByMappingUpdated = createAction<ToolNameByMapping>(
  "@allEntities/toolNameByMappingUpdated",
);

export const transferCountsByEntityGroupReset = createAction<undefined>(
  "@allEntities/transferCountsByEntityGroupReset",
);

export const createAllEntities = createAsyncAction<
  undefined,
  undefined,
  undefined
>("@allEntities/createAllEntities");

export const deleteAllEntities = createAsyncAction<
  undefined,
  undefined,
  undefined
>("@allEntities/deleteAllEntities");

export const fetchAllEntities = createAsyncAction<
  undefined,
  undefined,
  undefined
>("@allEntities/fetchAllEntities");

import { push } from "connected-react-router";
import cases from "jest-in-case";
import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";

import {
  flushAllEntities,
  updatePushAllChangesFetchStatus,
} from "~/modules/allEntities/allEntitiesActions";
import {
  toolNameByMappingSelector,
  totalIncludedRecordsCountSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { updateValidationFetchStatus } from "~/modules/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { sourceWorkspacesSelector } from "~/modules/workspaces/workspacesSelectors";
import { state } from "~/redux/__mocks__/mockStoreWithState";
import { RoutePath, FetchStatus, ToolName } from "~/typeDefs";

import { appSaga } from "../appSaga";

describe("within appSaga", () => {
  const providers = [
    [select(toolNameByMappingSelector), { source: ToolName.Toggl, target: ToolName.None }],
    [
      select(credentialsByMappingSelector),
      {
        source: {
          apiKey: "TOGGLAPIKEY",
          email: "test@test.io",
          userId: "123",
        },
        target: { apiKey: null, email: null, userId: null },
      },
    ],
    [select(sourceWorkspacesSelector), Object.values(state.workspaces.source)],
    [select(totalIncludedRecordsCountSelector), 0],
  ];

  const getRoutePathChangeAction = (routePath: RoutePath) =>
    ({
      type: "@@router/LOCATION_CHANGE",
      payload: {
        location: {
          pathname: routePath,
          search: "",
          hash: "",
          key: "detfl8",
        },
        action: "PUSH",
        isFirstRendering: false,
      },
    } as any);

  cases(
    "dispatches the appropriate actions when route path = PickToolAction or ToolActionSuccess",
    (options) => {
      return expectSaga(appSaga)
        .provide(providers as any)
        .put(options.expectedAction)
        .put(updateValidationFetchStatus(FetchStatus.Pending))
        .put(updatePushAllChangesFetchStatus(FetchStatus.Pending))
        .dispatch(getRoutePathChangeAction(options.routePath))
        .silentRun();
    },
    [
      {
        name: "when route path = PickToolAction",
        routePath: RoutePath.PickToolAction,
        expectedAction: flushAllEntities(),
      },
      {
        name: "when route path = ToolActionSuccess",
        routePath: RoutePath.ToolActionSuccess,
        expectedAction: flushAllEntities(),
      },
    ],
  );

  test(`redirects user to PickToolAction route if both of the tool names are "none"`, () => {
    const action = getRoutePathChangeAction(RoutePath.EnterApiKeys);
    return expectSaga(appSaga)
      .provide([[select(toolNameByMappingSelector), { source: "none", target: "none" }]])
      .put(push(RoutePath.PickToolAction))
      .dispatch(action)
      .silentRun();
  });

  test("redirects user to EnterApiKeys route if the credentials in state are invalid", () => {
    const action = getRoutePathChangeAction(RoutePath.SelectWorkspaces);
    return expectSaga(appSaga)
      .provide([
        [select(toolNameByMappingSelector), { source: ToolName.Toggl, target: ToolName.None }],
        [
          select(credentialsByMappingSelector),
          {
            source: { apiKey: null, email: null, userId: null },
            target: { apiKey: null, email: null, userId: null },
          },
        ],
      ])
      .put(push(RoutePath.EnterApiKeys))
      .dispatch(action)
      .silentRun();
  });

  test("redirects user to SelectWorkspaces route if no source workspaces are found in state", () => {
    const action = getRoutePathChangeAction(RoutePath.SelectInclusions);
    return expectSaga(appSaga)
      .provide([
        [select(toolNameByMappingSelector), { source: ToolName.Toggl, target: ToolName.None }],
        [
          select(credentialsByMappingSelector),
          {
            source: {
              apiKey: "TOGGLAPIKEY",
              email: "test@test.io",
              userId: "123",
            },
            target: { apiKey: null, email: null, userId: null },
          },
        ],
        [select(sourceWorkspacesSelector), []],
      ])
      .put(push(RoutePath.SelectWorkspaces))
      .dispatch(action)
      .silentRun();
  });

  test("redirects user to SelectInclusions route if the total inclusions count in state = 0", () => {
    const action = getRoutePathChangeAction(RoutePath.ToolActionSuccess);
    return expectSaga(appSaga)
      .provide([
        [select(toolNameByMappingSelector), { source: ToolName.Toggl, target: ToolName.None }],
        [
          select(credentialsByMappingSelector),
          {
            source: {
              apiKey: "TOGGLAPIKEY",
              email: "test@test.io",
              userId: "123",
            },
            target: { apiKey: null, email: null, userId: null },
          },
        ],
        [select(sourceWorkspacesSelector), Object.values(state.workspaces.source)],
        [select(totalIncludedRecordsCountSelector), 0],
      ])
      .put(push(RoutePath.SelectInclusions))
      .dispatch(action)
      .silentRun();
  });
});

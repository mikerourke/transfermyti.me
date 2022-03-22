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
import { routePathChanged } from "~/modules/app/appActions";
import { navigateToRoute } from "~/modules/app/navigateToRoute";
import { updateValidationFetchStatus } from "~/modules/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { sourceWorkspacesSelector } from "~/modules/workspaces/workspacesSelectors";
import { state } from "~/redux/__mocks__/mockStoreWithState";
import { RoutePath, FetchStatus, ToolName } from "~/typeDefs";

import { appSaga } from "../appSaga";

jest.mock("~/modules/app/navigateToRoute");

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

  cases(
    "dispatches the appropriate actions when route path = PickToolAction or ToolActionSuccess",
    (options) => {
      return expectSaga(appSaga)
        .provide(providers as any)
        .put(options.expectedAction)
        .put(updateValidationFetchStatus(FetchStatus.Pending))
        .put(updatePushAllChangesFetchStatus(FetchStatus.Pending))
        .dispatch(routePathChanged(options.routePath))
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
    return expectSaga(appSaga)
      .provide([[select(toolNameByMappingSelector), { source: "none", target: "none" }]])
      .call(navigateToRoute, RoutePath.PickToolAction)
      .dispatch(routePathChanged(RoutePath.EnterApiKeys))
      .silentRun();
  });

  test("redirects user to EnterApiKeys route if the credentials in state are invalid", () => {
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
      .call(navigateToRoute, RoutePath.EnterApiKeys)
      .dispatch(routePathChanged(RoutePath.SelectWorkspaces))
      .silentRun();
  });

  test("redirects user to SelectWorkspaces route if no source workspaces are found in state", () => {
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
      .call(navigateToRoute, RoutePath.SelectWorkspaces)
      .dispatch(routePathChanged(RoutePath.SelectInclusions))
      .silentRun();
  });

  test("redirects user to SelectInclusions route if the total inclusions count in state = 0", () => {
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
      .call(navigateToRoute, RoutePath.SelectInclusions)
      .dispatch(routePathChanged(RoutePath.ToolActionSuccess))
      .silentRun();
  });
});

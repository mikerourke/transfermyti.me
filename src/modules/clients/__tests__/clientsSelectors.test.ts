import cases from "jest-in-case";

import { FAKES } from "~/jestUtilities";
import { EntityGroup, ToolName } from "~/typeDefs";

import * as clientsSelectors from "../clientsSelectors";

const { REDUX_STATE } = FAKES;

const MOCK_STATE = {
  ...REDUX_STATE,
  clients: {
    source: {
      "3001": {
        id: "3001",
        name: "Test Client A",
        workspaceId: "1001",
        entryCount: 3,
        linkedId: "clock-client-01",
        isIncluded: false,
        memberOf: EntityGroup.Clients,
      },
      "3002": {
        id: "3002",
        name: "Test Client B",
        workspaceId: "1001",
        entryCount: 3,
        linkedId: null,
        isIncluded: false,
        memberOf: EntityGroup.Clients,
      },
      "3003": {
        id: "3003",
        name: "Test Client C",
        workspaceId: "1001",
        entryCount: 1,
        linkedId: null,
        isIncluded: true,
        memberOf: EntityGroup.Clients,
      },
    },
    target: {
      "clock-client-01": {
        id: "clock-client-01",
        name: "Test Client A",
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "3001",
        isIncluded: false,
        memberOf: EntityGroup.Clients,
      },
    },
    isFetching: false,
  },
};

describe("within clientsSelectors", () => {
  test("the sourceClientsByIdSelector returns state.source", () => {
    const result = clientsSelectors.sourceClientsByIdSelector(MOCK_STATE);

    expect(result).toEqual(MOCK_STATE.clients.source);
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(MOCK_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceClientsSelector",
        selector: clientsSelectors.includedSourceClientsSelector,
      },
      {
        name: "for the sourceClientsForTransferSelector",
        selector: clientsSelectors.sourceClientsForTransferSelector,
      },
      {
        name: "for the sourceClientsInActiveWorkspaceSelector",
        selector: clientsSelectors.sourceClientsInActiveWorkspaceSelector,
      },
      {
        name: "for the clientIdToLinkedIdSelector",
        selector: clientsSelectors.clientIdToLinkedIdSelector,
      },
      {
        name: "for the clientsTotalCountsByTypeSelector",
        selector: clientsSelectors.clientsTotalCountsByTypeSelector,
      },
    ],
  );

  cases(
    "the clientsForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown",
    (options) => {
      const updatedState = {
        ...MOCK_STATE,
        allEntities: {
          ...MOCK_STATE.allEntities,
          areExistsInTargetShown: options.areExistsInTargetShown,
        },
      };

      const result = clientsSelectors.clientsForInclusionsTableSelector(updatedState);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "when state.allEntities.areExistsInTargetShown = true",
        areExistsInTargetShown: true,
      },
      {
        name: "when state.allEntities.areExistsInTargetShown = false",
        areExistsInTargetShown: false,
      },
    ],
  );

  test("the clientIdsByNameSelectorFactory matches its snapshot", () => {
    const getClientIdsByName = clientsSelectors.clientIdsByNameSelectorFactory(ToolName.Toggl);

    const result = getClientIdsByName(MOCK_STATE);

    expect(result).toMatchSnapshot();
  });
});

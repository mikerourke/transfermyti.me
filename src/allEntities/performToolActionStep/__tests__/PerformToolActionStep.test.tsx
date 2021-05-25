import React from "react";
import { Provider } from "react-redux";

import PerformToolActionStep, {
  PerformToolActionStepComponent,
} from "../PerformToolActionStep";
import {
  includedCountsByEntityGroupSelector,
  transferCountsByEntityGroupSelector,
} from "~/allEntities/allEntitiesSelectors";
import { render, RenderResult } from "~/jestHelpers";
import {
  MockStore,
  mockStoreWithState,
  state,
} from "~/redux/__mocks__/mockStoreWithState";
import { FetchStatus, ToolAction, ReduxState } from "~/typeDefs";

// TODO: Fix this test, it's failing because of portals.
describe.skip("the <PerformToolActionStep> container component", () => {
  describe("when the <PerformToolActionStep> is not connected to Redux state", () => {
    const setupComponent = (
      propOverrides: any = {},
    ): { props: any; wrapper: RenderResult } => {
      const props = {
        pushAllChangesFetchStatus: FetchStatus.Pending,
        includedCountsByEntityGroup: includedCountsByEntityGroupSelector(state),
        toolAction: ToolAction.Delete,
        transferCountsByEntityGroup: transferCountsByEntityGroupSelector(state),
        onCreateAllEntities: jest.fn(),
        onDeleteAllEntities: jest.fn(),
        onPush: jest.fn(),
        onResetTransferCountsByEntityGroup: jest.fn(),
        ...propOverrides,
      };

      const wrapper = render(<PerformToolActionStepComponent {...props} />);

      return { wrapper, props };
    };

    test("displays the correct title based on props.toolAction", () => {
      const { wrapper } = setupComponent({ toolAction: ToolAction.Delete });

      expect(wrapper.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("when the <PerformToolActionStep> is connected to Redux state", () => {
    let store: MockStore;

    afterEach(() => {
      store.clearActions();
    });

    const setupContainer = (stateOverrides: Partial<ReduxState> = {}) => {
      store = mockStoreWithState(stateOverrides);

      const wrapper = render(
        <Provider store={store}>
          <PerformToolActionStep />
        </Provider>,
      );

      return { store, wrapper };
    };

    test("renders when connected to Redux state", () => {
      const { wrapper } = setupContainer();
      expect(wrapper).toHaveLength(1);
    });
  });
});

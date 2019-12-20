import React from "react";
import { fireEvent, render } from "@testing-library/react";
import state from "~/redux/__fixtures__/state";
import { selectTogglWorkspacesById } from "~/workspaces/workspacesSelectors";
import WorkspacesDropdown from "../WorkspacesDropdown";

const WORKSPACE_ID = "1001";

const setup = (propOverrides: any = {}) => {
  const props = {
    workspacesById: selectTogglWorkspacesById(state),
    activeWorkspaceId: WORKSPACE_ID,
    onItemClick: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<WorkspacesDropdown {...props} />);

  return { wrapper, props };
};

describe("<WorkspacesDropdown> Component", () => {
  test("activates the dropdown when the trigger button is clicked", () => {
    const { getByTestId } = setup().wrapper;
    fireEvent.click(getByTestId("workspaces-dropdown-trigger-button"));

    expect(getByTestId("workspaces-dropdown")).toHaveClass("is-active");
  });

  test("fires props.onItemClick when a dropdown item is clicked", () => {
    const {
      wrapper: { getByTestId, getAllByTestId },
      props,
    } = setup();
    fireEvent.click(getByTestId("workspaces-dropdown-trigger-button"));

    const [firstItem] = getAllByTestId("workspaces-dropdown-item");
    fireEvent.click(firstItem);

    expect(props.onItemClick).toHaveBeenCalled();
  });
});

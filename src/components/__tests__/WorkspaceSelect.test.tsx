import React from "react";

import WorkspaceSelect from "../WorkspaceSelect";
import { render, RenderResult, fireEvent } from "~/jestHelpers";
import state from "~/redux/__fixtures__/state";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    workspaces: Object.values(state.workspaces.source),
    onSelectWorkspace: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<WorkspaceSelect {...props} />);

  return { props, wrapper };
};

describe("the <WorkspaceSelect> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toBeInTheDocument();
  });

  test("fires props.onSelectWorkspace when a workspace is selected", () => {
    const { wrapper, props } = setup();
    fireEvent.change(wrapper.getByTestId("workspace-select"), {
      target: {
        value: "1001",
      },
    });
    const matchingWorkspace = state.workspaces.source["1001"];

    expect(props.onSelectWorkspace).toHaveBeenCalledWith(matchingWorkspace);
  });
});

import React from "react";

import NavigationButtonsRow from "../NavigationButtonsRow";
import { fireEvent, render, RenderResult } from "~/jestHelpers";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    disabled: false,
    loading: false,
    nextLabel: "Finish",
    onBackClick: jest.fn(),
    onNextClick: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<NavigationButtonsRow {...props} />);

  return { props, wrapper };
};

describe("the <NavigationButtonsRow> component", () => {
  test(`uses "Next" for the default label if props.nextLabel is undefined`, () => {
    const { wrapper } = setup({ nextLabel: undefined });

    expect(wrapper.getByText("Next")).toBeInTheDocument();
  });

  test("uses false for disabled and loading if props are undefined", () => {
    const { wrapper } = setup({ disabled: undefined, loading: undefined });

    expect(wrapper.getByText("Finish")).not.toHaveAttribute("disabled", "");
    expect(wrapper.queryByTestId("button-loading")).toBeNull();
  });

  test("fires prop events when buttons are clicked", () => {
    const { wrapper, props } = setup();
    const [backButton, nextButton] = wrapper.getAllByRole("button");

    fireEvent.click(backButton);
    expect(props.onBackClick).toHaveBeenCalled();

    fireEvent.click(nextButton);
    expect(props.onNextClick).toHaveBeenCalled();
  });
});

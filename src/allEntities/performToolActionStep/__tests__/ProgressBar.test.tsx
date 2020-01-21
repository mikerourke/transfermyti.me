import React from "react";
import { render, RenderResult } from "~/jestHelpers";
import ProgressBar from "../ProgressBar";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    completedCount: 10,
    totalCount: 20,
    title: "Test",
    ...propOverrides,
  };

  const wrapper = render(<ProgressBar {...props} />);

  return { props, wrapper };
};

describe("the <ProgressBar> component", () => {
  test("renders successfully with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.getByText("Test")).toBeInTheDocument();
  });

  test("renders nothing if props.totalCount = 0", () => {
    const { wrapper } = setup({ totalCount: 0 });

    expect(wrapper.queryByText("Test")).toBeNull();
  });

  test("uses 0% for width percentage if percentage is NaN", () => {
    const { wrapper } = setup({ completedCount: NaN, totalCount: 1 });

    expect(wrapper.getByTestId("progress-bar-filler")).toHaveStyleRule(
      "width",
      "0%",
    );
  });
});

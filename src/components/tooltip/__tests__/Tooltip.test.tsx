import React from "react";
import { render } from "@testing-library/react";
import Tooltip from "../Tooltip";

describe("<Tooltip> Component", () => {
  test(`renders successfully with valid props`, () => {
    const TEST_ID = "test-tooltip";
    const { container } = render(<Tooltip id={TEST_ID} delayShow={0} />);
    const tooltip = container.querySelector(`#${TEST_ID}`);

    expect(tooltip).toBeInTheDocument();
  });
});

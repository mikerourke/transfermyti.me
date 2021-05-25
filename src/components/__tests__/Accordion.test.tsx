import React from "react";

import Accordion from "../Accordion";
import { render } from "~/jestHelpers";

describe("the <Accordion> component", () => {
  test("renders successfully with valid props", () => {
    const wrapper = render(<Accordion>Test</Accordion>);

    expect(wrapper.getByRole("presentation")).toBeInTheDocument();
  });
});

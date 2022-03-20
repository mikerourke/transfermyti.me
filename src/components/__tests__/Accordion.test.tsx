import React from "react";

import { render } from "~/jestHelpers";

import Accordion from "../Accordion";

describe("the <Accordion> component", () => {
  test("renders successfully with valid props", () => {
    const wrapper = render(<Accordion>Test</Accordion>);

    expect(wrapper.getByRole("presentation")).toBeInTheDocument();
  });
});

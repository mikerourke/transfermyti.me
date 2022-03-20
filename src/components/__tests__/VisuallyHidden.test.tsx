import React from "react";

import { render } from "~/jestHelpers";

import VisuallyHidden from "../VisuallyHidden";

describe("the <VisuallyHidden> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<VisuallyHidden />);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

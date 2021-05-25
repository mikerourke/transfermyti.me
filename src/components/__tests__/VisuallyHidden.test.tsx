import React from "react";

import VisuallyHidden from "../VisuallyHidden";
import { render } from "~/jestHelpers";

describe("the <VisuallyHidden> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<VisuallyHidden />);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

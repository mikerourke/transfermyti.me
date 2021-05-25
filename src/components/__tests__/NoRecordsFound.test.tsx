import React from "react";

import NoRecordsFound from "../NoRecordsFound";
import { render } from "~/jestHelpers";

describe("the <NoRecordsFound> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<NoRecordsFound />);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

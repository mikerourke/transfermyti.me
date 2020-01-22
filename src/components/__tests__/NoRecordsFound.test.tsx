import React from "react";
import { render } from "~/jestHelpers";
import NoRecordsFound from "../NoRecordsFound";

describe("the <NoRecordsFound> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<NoRecordsFound />);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

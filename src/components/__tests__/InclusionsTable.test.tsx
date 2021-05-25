import React from "react";

import InclusionsTable from "../InclusionsTable";
import { render } from "~/jestHelpers";

describe("the <InclusionsTable> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<InclusionsTable />);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

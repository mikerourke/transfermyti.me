import React from "react";

import { render } from "~/jestHelpers";

import InclusionsTable from "../InclusionsTable";

describe("the <InclusionsTable> component", () => {
  test("matches its snapshot with valid props", () => {
    const wrapper = render(<InclusionsTable />);

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

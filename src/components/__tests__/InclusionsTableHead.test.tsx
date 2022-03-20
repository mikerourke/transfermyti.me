import React from "react";

import { render } from "~/jestHelpers";

import InclusionsTableHead from "../InclusionsTableHead";

describe("the <InclusionsTableHead> component", () => {
  test("renders successfully with valid props", () => {
    const wrapper = render(
      <table>
        <InclusionsTableHead labels={["Column A", "Column B"]} />
      </table>,
    );

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

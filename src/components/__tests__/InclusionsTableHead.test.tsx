import React from "react";

import InclusionsTableHead from "../InclusionsTableHead";
import { render } from "~/jestHelpers";

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

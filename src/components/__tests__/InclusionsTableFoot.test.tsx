import React from "react";

import InclusionsTableFoot from "../InclusionsTableFoot";
import { render, RenderResult } from "~/jestHelpers";

const TEST_TOTAL_COUNTS = {
  existsInTarget: 10,
  isIncluded: 10,
};

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    fieldCount: 3,
    totalCountsByType: { ...TEST_TOTAL_COUNTS },
    ...propOverrides,
  };

  const wrapper = render(
    <table>
      <InclusionsTableFoot {...props} />
    </table>,
  );

  return { props, wrapper };
};

describe("the <InclusionsTableFoot> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });

  test("displays the label as `Totals` if props.totalCountsByType has > 2 keys", () => {
    const { wrapper } = setup({
      totalCountsByType: { ...TEST_TOTAL_COUNTS, projectCount: 10 },
    });

    expect(wrapper.getByText("Totals")).toBeInTheDocument();
  });
});

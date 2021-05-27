import React from "react";

import InclusionsTableRow from "../InclusionsTableRow";
import { render, RenderResult } from "~/jestHelpers";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    disabled: false,
    ...propOverrides,
  };

  const wrapper = render(
    <table>
      <tbody>
        <InclusionsTableRow {...props} />
      </tbody>
    </table>,
  );

  return { props, wrapper };
};

describe("the <InclusionsTableRow> component", () => {
  test("matches its snapshot when props.disabled = true", () => {
    const { wrapper } = setup({ disabled: true });

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });

  test("matches its snapshot when props.disabled = false", () => {
    const { wrapper } = setup({ disabled: false });

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

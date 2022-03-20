import React from "react";

import InclusionsTableBody from "../InclusionsTableBody";
import { render, RenderResult } from "~/jestHelpers";
import { clientsForInclusionsTableSelector } from "~/modules/clients/clientsSelectors";
import { state } from "~/redux/__mocks__/mockStoreWithState";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    fieldNames: ["name", "entryCount", "projectCount"],
    tableData: clientsForInclusionsTableSelector(state),
    onFlipIsIncluded: jest.fn(),
    ...propOverrides,
  };

  const table = document.createElement("table");

  const wrapper = render(<InclusionsTableBody {...props} />, {
    container: document.body.appendChild(table),
  });

  return { props, wrapper };
};

describe("the <InclusionsTableBody> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});

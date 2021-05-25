import React from "react";

import Loader from "../Loader";
import { render } from "~/jestHelpers";

describe("<Loader> Component", () => {
  test(`displays no message if one props.children isn't specified`, () => {
    const { queryByText } = render(<Loader />);

    expect(queryByText("Loading")).toBeNull();
  });

  test("displays the message from props.children", () => {
    const expectedMessage = "Test Loading";
    const { getByText } = render(<Loader>{expectedMessage}</Loader>);

    expect(getByText(expectedMessage)).toBeDefined();
  });
});

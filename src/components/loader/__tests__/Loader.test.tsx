import React from "react";
import { render } from "@testing-library/react";
import Loader from "../Loader";

describe("<Loader> Component", () => {
  test(`displays a default message if one isn't specified`, () => {
    const { getByTestId } = render(<Loader />);
    const loaderMessage = getByTestId("loader-message");

    expect(loaderMessage).toHaveTextContent("Loading, please wait...");
  });

  test("displays the message from props.children", () => {
    const expectedMessage = "Test Loading";
    const { getByTestId } = render(<Loader>{expectedMessage}</Loader>);
    const loaderMessage = getByTestId("loader-message");

    expect(loaderMessage).toHaveTextContent(expectedMessage);
  });
});

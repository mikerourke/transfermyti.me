import React from "react";
import { render } from "@testing-library/react";
import PageHeader from "../PageHeader";

describe("<PageHeader> Component", () => {
  test("renders successfully with valid props", () => {
    const title = "Test Title";
    const subtitle = "Test Subtitle";
    const { getByTestId } = render(
      <PageHeader title={title} subtitle={subtitle} />,
    );

    expect(getByTestId("page-header-title")).toHaveTextContent(title);
    expect(getByTestId("page-header-subtitle")).toHaveTextContent(subtitle);
  });
});

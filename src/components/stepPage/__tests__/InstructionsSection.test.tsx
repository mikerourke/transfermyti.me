import React from "react";
import cases from "jest-in-case";
import { fireEvent, render } from "@testing-library/react";
import { iconAttributes } from "~/components/Icon";
import InstructionsSection from "../InstructionsSection";

describe("<InstructionsSection> Component", () => {
  test("renders successfully", () => {
    const { getByTestId } = render(<InstructionsSection />);

    expect(getByTestId("instructions-section")).toBeInTheDocument();
  });

  cases(
    "show/hides the instructions when the correct elements are clicked",
    options => {
      const { getByTestId } = render(<InstructionsSection />);
      expect(getByTestId("toggle-expanded-label")).toHaveTextContent("Hide");

      fireEvent.click(getByTestId(options.testId));
      expect(getByTestId("toggle-expanded-label")).toHaveTextContent("Show");
    },
    [
      {
        name: "expands the instructions when the toggle button is clicked",
        testId: "toggle-expanded-button",
      },
      {
        name: "expands the instructions when the toggle label is clicked",
        testId: "toggle-expanded-label",
      },
    ],
  );

  test("displays the correct icon based on whether the instructions are expanded", () => {
    const { getByTestId } = render(<InstructionsSection />);
    expect(getByTestId("svg-icon-path").getAttribute("d")).toBe(
      iconAttributes.expandLess.path,
    );

    fireEvent.click(getByTestId("toggle-expanded-button"));
    expect(getByTestId("svg-icon-path").getAttribute("d")).toBe(
      iconAttributes.expandMore.path,
    );
  });
});

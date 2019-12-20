import React from "react";
import cases from "jest-in-case";
import { fireEvent, render } from "@testing-library/react";
import Checkbox, { statePaths } from "../Checkbox";

describe("<Checkbox> Component", () => {
  cases(
    "renders the correct path based on the checked prop",
    options => {
      const { getByTestId } = render(
        <Checkbox checked={options.checked} size={24} onClick={jest.fn()} />,
      );
      const pathD = getByTestId("checkbox-path").getAttribute("d");

      expect(pathD).toBe(options.expected);
    },
    [
      {
        name: "when props.checked = true",
        checked: true,
        expected: statePaths[0],
      },
      {
        name: "when props.checked = false",
        checked: false,
        expected: statePaths[1],
      },
      {
        name: "when props.checked = undefined",
        checked: undefined,
        expected: statePaths[2],
      },
    ],
  );

  test("fires props.onClick when the <svg> element is clicked", () => {
    const onClick = jest.fn();
    const { getByTestId } = render(
      <Checkbox checked size={24} onClick={onClick} />,
    );
    fireEvent.click(getByTestId("checkbox-svg"));

    expect(onClick).toHaveBeenCalled();
  });
});

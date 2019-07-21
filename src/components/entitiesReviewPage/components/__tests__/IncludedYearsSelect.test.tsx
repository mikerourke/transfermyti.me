import React from "react";
import { render } from "@testing-library/react";
import IncludedYearsSelect from "../IncludedYearsSelect";

const TEST_INCLUSIONS_BY_YEAR = {
  "2017": true,
  "2018": true,
  "2019": false,
};

const setup = (propOverrides: any = {}) => {
  const props = {
    inclusionsByYear: TEST_INCLUSIONS_BY_YEAR,
    onUpdateIncludedYear: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<IncludedYearsSelect {...props} />);

  return { wrapper, props };
};

describe("<IncludedYearsSelect> Component", () => {
  test("renders with valid props", () => {
    const { getByTestId } = setup().wrapper;
    expect(getByTestId("included-years-select-wrapper")).toBeInTheDocument();
  });

  test.todo("determine how to test change events");
});

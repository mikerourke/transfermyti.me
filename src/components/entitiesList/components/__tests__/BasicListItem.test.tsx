import React from "react";
import cases from "jest-in-case";
import { fireEvent, render } from "@testing-library/react";
import BasicListItem from "../BasicListItem";

const TEST_ENTITY_RECORD = {
  name: "Test",
  isIncluded: true,
  entryCount: 5,
};

const setup = (propOverrides: any = {}) => {
  const props = {
    entityRecord: TEST_ENTITY_RECORD,
    isOmitted: false,
    onItemClick: jest.fn(),
    isScrolling: false,
    isVisible: false,
    ...propOverrides,
  };

  const wrapper = render(<BasicListItem {...props} />);

  return { wrapper, props };
};

describe("<BasicListItem> Component", () => {
  test(`does not display the <Checkbox> when props.onItemClick is defined`, () => {
    const { queryByTestId } = setup({ onItemClick: undefined }).wrapper;

    expect(queryByTestId("checkbox-svg")).toBeNull();
  });

  test(`fires props.onItemClick when the inner <Checkbox> is clicked`, () => {
    const { wrapper, props } = setup();
    const checkboxSvg = wrapper.getByTestId("checkbox-svg");
    fireEvent.click(checkboxSvg);

    expect(props.onItemClick).toHaveBeenCalled();
  });

  cases(
    `displays the proper entry label based on entry count`,
    options => {
      const { getByTestId } = setup({
        entityRecord: options.entityRecord,
      }).wrapper;
      const countLabel = getByTestId("list-item-count-label");

      expect(countLabel).toHaveTextContent(options.expected);
    },
    [
      {
        name: `shows "entry" if entry count = 1`,
        entityRecord: { ...TEST_ENTITY_RECORD, entryCount: 1 },
        expected: /entry/g,
      },
      {
        name: `shows "entries" if entry count > 1`,
        entityRecord: { ...TEST_ENTITY_RECORD, entryCount: 5 },
        expected: /entries/g,
      },
      {
        name: `shows "entries" if entry count = undefined`,
        entityRecord: { ...TEST_ENTITY_RECORD, entryCount: undefined },
        expected: /entries/g,
      },
    ],
  );
});

import cases from "jest-in-case";
import React from "react";

import { render, RenderResult, fireEvent } from "~/jestHelpers";

import InclusionsTableCheckboxCell from "../InclusionsTableCheckboxCell";

const TEST_ENTITY_RECORD = {
  id: "testEntity",
  existsInTarget: false,
  isIncluded: false,
};

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    entityRecord: { ...TEST_ENTITY_RECORD },
    onFlipIsIncluded: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(
    <table>
      <tbody>
        <tr>
          <InclusionsTableCheckboxCell {...props} />
        </tr>
      </tbody>
    </table>,
  );

  return { props, wrapper };
};

describe("the <InclusionsTableCheckboxCell> component", () => {
  test("renders successfully with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.getByRole("checkbox")).toBeInTheDocument();
  });

  cases(
    "sets the checkbox input attributes based on props.entityRecord",
    (options) => {
      const { wrapper } = setup({ entityRecord: options.entityRecord });
      const checkbox = wrapper.getByRole("checkbox");

      for (const [key, value] of Object.entries(options.attrs)) {
        expect(checkbox).toHaveAttribute(key, value);
      }
    },
    [
      {
        name: "when props.entityRecord.existsInTarget = true",
        entityRecord: { ...TEST_ENTITY_RECORD, existsInTarget: true },
        attrs: { disabled: "" },
      },
      {
        name: "when props.entityRecord.isIncluded = true",
        entityRecord: { ...TEST_ENTITY_RECORD, isIncluded: true },
        attrs: { checked: "" },
      },
      {
        name: "when props.entityRecord.existsInTarget = false props.entityRecord.isIncluded = true",
        entityRecord: {
          ...TEST_ENTITY_RECORD,
          existsInTarget: false,
          isIncluded: true,
        },
        attrs: { checked: "" },
      },
    ],
  );

  test("fires props.onFlipIsIncluded when input onChange event fires", () => {
    const { wrapper, props } = setup({
      entityRecord: {
        ...TEST_ENTITY_RECORD,
        existsInTarget: false,
        isIncluded: false,
      },
    });
    fireEvent.click(wrapper.getByRole("checkbox"));

    expect(props.onFlipIsIncluded).toHaveBeenCalledWith(TEST_ENTITY_RECORD.id);
  });
});

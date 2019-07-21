import React from "react";
import { render } from "@testing-library/react";
import EntityTagsRow from "../EntityTagsRow";

const TEST_ENTITY_RECORD: any = {
  name: "Test",
  isIncluded: true,
  isActive: true,
  linkedId: null,
};

const setup = (propOverrides: any = {}) => {
  const props = {
    entityRecord: TEST_ENTITY_RECORD,
    isTimeEntry: false,
    ...propOverrides,
  };

  const wrapper = render(<EntityTagsRow {...props} />);

  return { wrapper, props };
};

describe("<EntityTagsRow> Component", () => {
  test("displays the Archived tag when props.entityRecord.isActive = false", () => {
    const { queryByText } = setup({
      entityRecord: { ...TEST_ENTITY_RECORD, isActive: false },
    }).wrapper;

    expect(queryByText(/archived/gi)).not.toBeNull();
  });

  test("displays the Excluded tag when props.entityRecord.isIncluded = false", () => {
    const { queryByText } = setup({
      entityRecord: { ...TEST_ENTITY_RECORD, isIncluded: false },
    }).wrapper;

    expect(queryByText(/excluded/gi)).not.toBeNull();
  });

  test("displays the Existing tag when props.entityRecord.linkedId is not null", () => {
    const { queryByText } = setup({
      entityRecord: { ...TEST_ENTITY_RECORD, linkedId: "100" },
    }).wrapper;

    expect(queryByText(/existing/gi)).not.toBeNull();
  });

  test("tags are smaller if props.isTimeEntry = true", () => {
    const { getByTestId } = setup({
      isTimeEntry: true,
      entityRecord: { ...TEST_ENTITY_RECORD, isIncluded: false },
    }).wrapper;
    const tagHeight = getByTestId("entity-tag").style.height;

    expect(tagHeight).toBe("1.5rem");
  });
});

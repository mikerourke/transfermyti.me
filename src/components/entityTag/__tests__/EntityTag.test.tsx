import React from "react";
import cases from "jest-in-case";
import { render } from "@testing-library/react";
import EntityTag, { EntityTagType } from "../EntityTag";

const setup = (propOverrides: any = {}) => {
  const props = {
    size: "small",
    tagType: EntityTagType.Archived,
    ...propOverrides,
  };

  const wrapper = render(<EntityTag {...props} />);

  return { wrapper, props };
};

describe("<EntityTag> Component", () => {
  test(`has the correct height when props.size = "small"`, () => {
    const { getByTestId } = setup({ size: "small" }).wrapper;
    const { height } = window.getComputedStyle(getByTestId("entity-tag"));

    expect(height).toBe("1.5rem");
  });

  cases(
    "is the correct color based on props.tagType",
    options => {
      const { getByTestId } = setup({ tagType: options.tagType }).wrapper;
      const tagClasses = getByTestId("entity-tag").getAttribute("class");

      expect(tagClasses).toMatch(options.match);
    },
    [
      {
        name: `is yellow when props.tagType = "Archived"`,
        tagType: EntityTagType.Archived,
        match: /warning/gi,
      },
      {
        name: `is red when props.tagType = "Excluded"`,
        tagType: EntityTagType.Excluded,
        match: /danger/gi,
      },
      {
        name: `is blue when props.tagType = "Existing"`,
        tagType: EntityTagType.Existing,
        match: /info/gi,
      },
    ],
  );
});

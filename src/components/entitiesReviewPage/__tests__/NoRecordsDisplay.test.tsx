import React from "react";
import cases from "jest-in-case";
import { render } from "@testing-library/react";
import NoRecordsDisplay from "../NoRecordsDisplay";
import { EntityGroup, ToolName } from "~/commonTypes";

const setup = (propOverrides: any = {}) => {
  const props = {
    activeEntityGroup: EntityGroup.TimeEntries,
    height: 150,
    toolName: ToolName.Clockify,
    ...propOverrides,
  };

  const wrapper = render(<NoRecordsDisplay {...props} />);

  return { wrapper, props };
};

describe("<NoRecordsDisplay> Component", () => {
  cases(
    "displays the properly formatted entity group based on props.activeEntityGroup",
    options => {
      const { getByTestId } = setup({
        activeEntityGroup: options.activeEntityGroup,
      }).wrapper;

      expect(getByTestId("no-records-display")).toHaveTextContent(
        options.expected,
      );
    },
    [
      {
        name: "shows time entries when props.activeEntityGroup = timeEntries",
        activeEntityGroup: EntityGroup.TimeEntries,
        expected: "time entries",
      },
      {
        name: "shows user groups when props.activeEntityGroup = userGroups",
        activeEntityGroup: EntityGroup.UserGroups,
        expected: "user groups",
      },
      {
        name: "shows clients when props.activeEntityGroup = clients",
        activeEntityGroup: EntityGroup.Clients,
        expected: "clients",
      },
    ],
  );
});

import React from "react";
import { get } from "lodash";
import { fireEvent, render } from "@testing-library/react";
import state from "~/redux/__fixtures__/state";
import { selectTogglCountsByGroupByWorkspace } from "~/workspaces/workspacesSelectors";
import PageFooter from "../PageFooter";
import { EntityGroup } from "~/common/commonTypes";

const WORKSPACE_ID = "1001";
const countsByGroupByWorkspace = selectTogglCountsByGroupByWorkspace(state);

const setup = (propOverrides: any = {}) => {
  const activeEntityGroup =
    propOverrides.activeEntityGroup || EntityGroup.Clients;
  const groupRecordCounts = get(countsByGroupByWorkspace, [
    WORKSPACE_ID,
    activeEntityGroup,
  ]);

  const props = {
    activeEntityGroup,
    groupRecordCounts,
    showInclusionsOnly: false,
    onFlipInclusionsOnly: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<PageFooter {...props} />);

  return { wrapper, props };
};

describe("<PageFooter> Component", () => {
  test("group totals display is in the correct format", () => {
    const {
      wrapper: { getByTestId },
      props,
    } = setup();
    const { includedRecordCount, totalRecordCount } = props.groupRecordCounts;
    const expected = `Clients to Transfer (${includedRecordCount}/${totalRecordCount})`;

    expect(getByTestId("group-totals-display-label")).toHaveTextContent(
      expected,
    );
  });

  test("checkbox is checked when props.showInclusionsOnly = true", () => {
    const { getByTestId } = setup({ showInclusionsOnly: true }).wrapper;
    const ariaLabel = getByTestId("checkbox-svg").getAttribute("aria-checked");

    expect(ariaLabel).toBe("true");
  });

  test("fires props.onFlipInclusionsOnly when checkbox is clicked", () => {
    const {
      wrapper: { getByTestId },
      props,
    } = setup();
    fireEvent.click(getByTestId("checkbox-svg"));

    expect(props.onFlipInclusionsOnly).toHaveBeenCalled();
  });

  // TODO: Re-enable this once you finish implementing the time entry duplication check.
  // cases(
  //   "displays the correct amount of group totals based on props.activeEntityGroup",
  //   options => {
  //     const { getAllByTestId } = setup({
  //       activeEntityGroup: options.activeEntityGroup,
  //     }).wrapper;
  //
  //     expect(getAllByTestId("group-totals-display-label")).toHaveLength(
  //       options.expected,
  //     );
  //   },
  //   [
  //     {
  //       name:
  //         "displays 2 group totals when props.activeEntityGroup is not timeEntries",
  //       activeEntityGroup: EntityGroup.Clients,
  //       expected: 2,
  //     },
  //     {
  //       name:
  //         "displays 1 group total when props.activeEntityGroup = timeEntries",
  //       activeEntityGroup: EntityGroup.TimeEntries,
  //       expected: 1,
  //     },
  //   ],
  // );
});

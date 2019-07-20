import React from "react";
import { last } from "lodash";
import { fireEvent, render } from "@testing-library/react";
import {
  selectTogglCountsByGroupByWorkspace,
  selectTogglEntitiesByGroupByWorkspace,
  selectTogglWorkspacesById,
} from "~/redux/entities/workspaces/workspacesSelectors";
import state from "~/redux/__fixtures__/state";
import EntitiesReviewPage from "../EntitiesReviewPage";
import { ToolName } from "~/types";

const WORKSPACE_ID = "1001";
const entitiesByGroupByWorkspace = selectTogglEntitiesByGroupByWorkspace(state);

const setup = (propOverrides: any = {}) => {
  const props = {
    subtitle: "TEST_SUBTITLE",
    toolName: ToolName.Toggl,
    countsByGroupByWorkspace: selectTogglCountsByGroupByWorkspace(state),
    entitiesByGroupByWorkspace,
    workspacesById: selectTogglWorkspacesById(state),
    onRefreshClick: jest.fn(),
    onFlipIsWorkspaceEntityIncluded: jest.fn(),
    onUpdateIsWorkspaceYearIncluded: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<EntitiesReviewPage {...props} />);

  return { wrapper, props };
};

describe("<EntitiesReviewPage> Component", () => {
  test("renders successfully when all records are shown", () => {
    const { queryByTestId } = setup().wrapper;

    expect(queryByTestId("step-page")).not.toBeNull();
  });

  test("renders successfully when only inclusions are shown", () => {
    const byGroup = entitiesByGroupByWorkspace[WORKSPACE_ID];
    const updatedEntitiesByGroupByWorkspace = {
      ...entitiesByGroupByWorkspace,
      [WORKSPACE_ID]: {
        ...byGroup,
        projects: [
          ...byGroup.projects,
          { ...byGroup.projects[4], linkedId: null },
          { ...byGroup.projects[5], linkedId: null, isIncluded: false },
        ],
      },
    };

    const { getByTestId, queryByTestId } = setup({
      entitiesByGroupByWorkspace: updatedEntitiesByGroupByWorkspace,
    }).wrapper;
    fireEvent.click(getByTestId("checkbox-svg"));

    expect(queryByTestId("step-page")).not.toBeNull();
  });

  test("displays the no records shown message if the active entity group has no records", () => {
    const byGroup = entitiesByGroupByWorkspace[WORKSPACE_ID];
    const updatedEntitiesByGroupByWorkspace = {
      ...entitiesByGroupByWorkspace,
      [WORKSPACE_ID]: {
        ...byGroup,
        projects: [] as any,
      },
    };

    const { queryByTestId } = setup({
      entitiesByGroupByWorkspace: updatedEntitiesByGroupByWorkspace,
    }).wrapper;

    expect(queryByTestId("no-records-display")).not.toBeNull();
  });

  test("shows the included year select for time entries", () => {
    const { getAllByTestId, queryByTestId } = setup().wrapper;
    fireEvent.click(last(getAllByTestId("entity-tab")));

    expect(queryByTestId("included-years-select-wrapper")).not.toBeNull();
  });

  test("does not show the included year select if props.onUpdateIsWorkspaceYearIncluded is undefined", () => {
    const { getAllByTestId, queryByTestId } = setup({
      onUpdateIsWorkspaceYearIncluded: undefined,
    }).wrapper;
    fireEvent.click(last(getAllByTestId("entity-tab")));

    expect(queryByTestId("included-years-select-wrapper")).toBeNull();
  });
});

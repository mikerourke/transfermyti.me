import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { get } from "lodash";
import state from "~/redux/__fixtures__/state";
import { selectTogglEntitiesByGroupByWorkspace } from "~/workspaces/workspacesSelectors";
import EntitiesList from "../EntitiesList";
import { EntityGroup } from "~/common/commonTypes";

const entitiesByGroupByWorkspace = selectTogglEntitiesByGroupByWorkspace(state);

const setup = (propOverrides: any = {}) => {
  const groupToUse = get(propOverrides, "entityGroup", EntityGroup.Projects);
  const activeEntityRecords = get(entitiesByGroupByWorkspace, [
    "1001",
    groupToUse,
  ]);

  const props = {
    entityGroup: groupToUse,
    entityRecords: activeEntityRecords,
    height: 100,
    width: 200,
    onItemClick: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<EntitiesList {...props} />);

  return { wrapper, props };
};

describe("<EntitiesList> Component", () => {
  test(`renders <BasicListItem> when props.entityGroup is not time entries`, () => {
    const { queryAllByTestId } = setup().wrapper;
    const basicListItems = queryAllByTestId("basic-list-item");

    expect(basicListItems).not.toHaveLength(0);
  });

  test(`fires props.onItemClick when a list item's checkbox is clicked`, () => {
    const {
      wrapper: { getAllByTestId },
      props,
    } = setup();
    const [firstCheckbox] = getAllByTestId("checkbox-svg");
    fireEvent.click(firstCheckbox);

    expect(props.onItemClick).toHaveBeenCalled();
  });

  test("does not show checkbox if props.onItemClick is undefined", () => {
    const { queryAllByTestId } = setup({ onItemClick: undefined }).wrapper;
    const checkboxes = queryAllByTestId("checkbox-svg");

    expect(checkboxes).toHaveLength(0);
  });

  test("renders <TimeEntryListItem> when props.entityGroup is time entries", () => {
    const { queryAllByTestId } = setup({
      entityGroup: EntityGroup.TimeEntries,
    }).wrapper;
    const timeEntryListItems = queryAllByTestId("time-entry-list-item");

    expect(timeEntryListItems).not.toHaveLength(0);
  });
});

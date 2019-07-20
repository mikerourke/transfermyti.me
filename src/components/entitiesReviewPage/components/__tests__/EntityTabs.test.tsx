import React from "react";
import { fireEvent, render } from "@testing-library/react";
import EntityTabs from "../EntityTabs";
import { EntityGroup } from "~/types";

const setup = (propOverrides: any = {}) => {
  const props = {
    activeTab: EntityGroup.Projects,
    onTabClick: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<EntityTabs {...props} />);

  return { wrapper, props };
};

describe("<EntityTabs> Component", () => {
  test("shows the correct amount of tabs", () => {
    const { queryAllByTestId } = setup().wrapper;
    const entityTabs = queryAllByTestId("entity-tab");

    expect(entityTabs).toHaveLength(5);
  });

  test("shows the correct tab as active based on props.activeTab", () => {
    const { queryAllByTestId } = setup().wrapper;
    const [projectsTab] = queryAllByTestId("entity-tab");

    expect(projectsTab).toHaveClass("is-active");
  });

  test("fires props.onTabClick when a tab is clicked", () => {
    const {
      wrapper: { queryAllByTestId },
      props,
    } = setup();
    const [, clientsTab] = queryAllByTestId("entity-tab");
    fireEvent.click(clientsTab);

    expect(props.onTabClick).toHaveBeenCalledWith(EntityGroup.Clients);
  });
});

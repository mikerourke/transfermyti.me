import React from "react";
import { render } from "@testing-library/react";
import TimeEntryListItem from "../TimeEntryListItem";

const TEST_TIME_ENTRY = {
  id: "8001",
  description: "This is a test entry (01)",
  projectId: "2001",
  taskId: null as any,
  userId: "6001",
  userGroupIds: [] as any,
  workspaceId: "1001",
  clientId: "3001",
  clientName: "Test Client A",
  isBillable: false,
  start: "2019-06-25T18:00:00.000Z",
  end: "2019-06-25T23:00:00.000Z",
  year: 2019,
  tagNames: ["tag-a", "tag-b"],
  isActive: true,
  name: null as any,
  linkedId: null as any,
  isIncluded: true,
  memberOf: "timeEntries",
  client: {
    id: "3001",
    name: "Test Client A",
    workspaceId: "1001",
    linkedId: null as any,
    isIncluded: true,
    memberOf: "clients",
    entryCount: 3,
  },
  project: {
    id: "2001",
    name: "Test Project A",
    workspaceId: "1001",
    clientId: "3001",
    isBillable: false,
    isPublic: false,
    isActive: true,
    color: "#ea468d",
    userIds: ["6001"],
    linkedId: "clock-project-01",
    isIncluded: true,
    memberOf: "projects",
    entryCount: 3,
  },
  task: null as any,
  tags: [
    {
      id: "4001",
      name: "tag-a",
      workspaceId: "1001",
      entryCount: 1,
      linkedId: null as any,
      isIncluded: true,
      memberOf: "tags",
    },
    {
      id: "4002",
      name: "tag-b",
      workspaceId: "1001",
      entryCount: 1,
      linkedId: null,
      isIncluded: true,
      memberOf: "tags",
    },
  ],
  user: {
    id: "6001",
    name: "John Test",
    email: "test-user@test.com",
    isAdmin: null as any,
    isActive: true,
    userGroupIds: [] as any,
    workspaceId: "1001",
    linkedId: null as any,
    isIncluded: true,
    memberOf: "users",
    entryCount: 20,
  },
  workspace: {
    id: "1001",
    name: "Test Workspace",
    userIds: ["6001"],
    inclusionsByYear: { "2017": true, "2018": true, "2019": true },
    isAdmin: true,
    workspaceId: "1001",
    entryCount: 0,
    linkedId: "clock-workspace-01",
    isIncluded: true,
    memberOf: "workspaces",
  },
};

const setup = (propOverrides: any = {}) => {
  const props = {
    timeEntry: TEST_TIME_ENTRY,
    isOmitted: false,
    ...propOverrides,
  };

  const wrapper = render(<TimeEntryListItem {...props} />);

  return { wrapper, props };
};

describe("<TimeEntryListItem> Component", () => {
  test(`renders successfully when props.isOmitted = true`, () => {
    const { queryByTestId } = setup({ isOmitted: true }).wrapper;

    expect(queryByTestId("entity-tags-row")).not.toBeNull();
    expect(queryByTestId("time-entry-table")).not.toBeNull();
  });
});

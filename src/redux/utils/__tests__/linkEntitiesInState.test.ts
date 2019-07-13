/* eslint-disable @typescript-eslint/indent */
import { linkEntitiesInStateByName } from "~/redux/utils";
import { EntityGroup } from "~/types/entityTypes";

// prettier-ignore
const tagsState = {
    clockify: {
      byId: {
        'C1': { id: 'C1', name: 'blog', workspaceId: 'CW1', entryCount: 0, linkedId: null as any, isIncluded: true, },
        'C2': { id: 'C2', name: 'deployment', workspaceId: 'CW1', entryCount: 0, linkedId: null as any, isIncluded: true, },
        'C3': { id: 'C3', name: 'git', workspaceId: 'CW1', entryCount: 0, linkedId: null as any, isIncluded: true, },
        'C4': { id: 'C4', name: 'javascript', workspaceId: 'CW1', entryCount: 0, linkedId: null as any, isIncluded: true, },
      },
      idValues: ['C1', 'C2', 'C3', 'C4'],
    },
    toggl: {
      byId: {
        'T1': { id: 'T1', name: 'git', workspaceId: 'TW1', entryCount: 0, linkedId: null as any, isIncluded: true, },
        'T2': { id: 'T2', name: 'api', workspaceId: 'TW1', entryCount: 6, linkedId: null as any, isIncluded: true, },
        'T3': { id: 'T3', name: 'deployment', workspaceId: 'TW1', entryCount: 0, linkedId: null as any, isIncluded: true, },
        'T4': { id: 'T4', name: 'react', workspaceId: 'TW1', entryCount: 37, linkedId: null as any, isIncluded: true, },
        'T5': { id: 'T5', name: 'blog', workspaceId: 'TW1', entryCount: 7, linkedId: null as any, isIncluded: true, },
        'T6': { id: 'T6', name: 'python', workspaceId: 'TW1', entryCount: 2, linkedId: null as any, isIncluded: true, },
        'T7': { id: 'T7', name: 'javascript', workspaceId: 'TW1', entryCount: 29, linkedId: null as any, isIncluded: true, },
      },
      idValues: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    },
};

describe("the linkEntitiesInState method", () => {
  test("links entities with the same name and matches snapshot", () => {
    const result = linkEntitiesInStateByName(EntityGroup.Tags, tagsState);
    expect(result).toMatchSnapshot();
  });

  // TODO: Write test for time entries
});

/* eslint-disable @typescript-eslint/indent */
import { linkEntitiesInState } from '../linkEntitiesInState';
import { EntityGroup } from '~/types/entityTypes';

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

// prettier-ignore
const timeEntriesState = {
  clockify: {
    byId: {
      C1: { id: 'C1', description: 'Perform maintenance on stuff.', projectId: 'CP1', userId: 'CU1', workspaceId: 'CW1', start: '2017-10-26T15:00:23.000Z', end: '2017-10-26T17:15:23.000Z', linkedId: null as any, isIncluded: true },
      C2: { id: 'C2', description: 'Continue performing maintenance on thing.', projectId: 'CP1', userId: 'CU1', workspaceId: 'CW1', start: '2017-10-26T18:00:56.000Z', end: '2017-10-26T20:00:56.000Z', linkedId: null as any, isIncluded: true },
      C3: { id: 'C3', description: 'Continue working on thing.', projectId: 'CP2', userId: 'CU1', workspaceId: 'CW1', start: '2017-10-19T18:00:49.000Z', end: '2017-10-19T22:00:49.000Z', linkedId: null as any, isIncluded: true },
      C4: { id: 'C4', description: 'Continue working on thing.', projectId: 'CP2', userId: 'CU1', workspaceId: 'CW1', start: '2017-10-25T18:00:10.000Z', end: '2017-10-25T22:00:10.000Z', linkedId: null as any, isIncluded: true },
      C5: { id: 'C5', description: 'Begin working on thing', projectId: 'CP2', userId: 'CU1', workspaceId: 'CW1', start: '2017-10-17T18:00:14.000Z', end: '2017-10-17T22:00:14.000Z', linkedId: null as any, isIncluded: true },
      C6: { id: 'C6', description: 'Continue working on stuff.', projectId: 'CP2', userId: 'CU1', workspaceId: 'CW1', start: '2017-10-20T14:30:02.000Z', end: '2017-10-20T17:00:02.000Z', linkedId: null as any, isIncluded: true },
    },
    idValues: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  },
  toggl: {
    byId: {
      T1: { id: 'T1', description: 'Perform maintenance on stuff.', projectId: 'TP1', userId: 'TU1', workspaceId: 'TW1', start: '2017-10-26T15:00:23.000Z', end: '2017-10-26T17:15:23.000Z', linkedId: null as any, isIncluded: true },
      T2: { id: 'T2', description: 'Continue performing maintenance on thing.', projectId: 'TP1', userId: 'TU1', workspaceId: 'TW1', start: '2017-10-26T18:00:56.000Z', end: '2017-10-26T20:00:56.000Z', linkedId: null as any, isIncluded: true },
      T3: { id: 'T3', description: 'Continue working on thing.', projectId: 'TP2', userId: 'TU1', workspaceId: 'TW1', start: '2017-10-19T18:00:49.000Z', end: '2017-10-19T22:00:49.000Z', linkedId: null as any, isIncluded: true },
      T4: { id: 'T4', description: 'Continue working on thing.', projectId: 'TP2', userId: 'TU1', workspaceId: 'TW1', start: '2017-10-25T18:00:10.000Z', end: '2017-10-25T22:00:10.000Z', linkedId: null as any, isIncluded: true },
      T5: { id: 'T5', description: 'Begin working on thing', projectId: 'TP2', userId: 'TU1', workspaceId: 'TW1', start: '2017-10-17T18:00:14.000Z', end: '2017-10-17T22:00:14.000Z', linkedId: null as any, isIncluded: true },
      T6: { id: 'T6', description: 'Continue working on stuff.', projectId: 'TP2', userId: 'TU1', workspaceId: 'TW1', start: '2017-10-20T14:30:02.000Z', end: '2017-10-20T17:00:02.000Z', linkedId: null as any, isIncluded: true },
      T7: { id: 'T7', description: 'Begin working on noodles.', projectId: 'TP3', userId: 'TU1', workspaceId: 'TW1', start: '2018-04-20T18:00:39.000Z', end: '2018-04-20T21:00:39.000Z', linkedId: null as any, isIncluded: true },
      T8: { id: 'T8', description: 'Continue working on caboodle.', projectId: 'TP3', userId: 'TU1', workspaceId: 'TW1', start: '2018-04-21T18:45:38.000Z', end: '2018-04-21T20:00:38.000Z', linkedId: null as any, isIncluded: true },
      T9: { id: 'T9', description: 'Continue working on other thing.', projectId: 'TP3', userId: 'TU1', workspaceId: 'TW1', start: '2018-04-21T20:15:28.000Z', end: '2018-04-21T22:30:28.000Z', linkedId: null as any, isIncluded: true },
    },
    idValues: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'],
  },
};

describe('the linkEntitiesInState method', () => {
  test('links entities with the same name and matches snapshot', () => {
    const result = linkEntitiesInState(EntityGroup.Tags, tagsState);
    expect(result).toMatchSnapshot();
  });

  // TODO: Write test for time entries
  console.warn(timeEntriesState);
});

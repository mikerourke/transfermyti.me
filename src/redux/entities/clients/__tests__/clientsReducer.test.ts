import cases from 'jest-in-case';
import * as clientsActions from '../clientsActions';
import clientsReducer, { initialState } from '../clientsReducer';

const clockifyClientsPayload = [
  {
    id: '2FZn1Y9R5M4nnMGV9K32xJ',
    name: 'Client A',
    workspaceId: 'aZJSPbcPw1cpdfYmtHM7za',
  },
  {
    id: 'ir4aN5VF7pdfDrgWjGCxeR',
    name: 'Client B',
    workspaceId: 'aZJSPbcPw1cpdfYmtHM7za',
  },
  {
    id: 'uABwBW6XWsWLRzRtKY1gow',
    name: 'Client C',
    workspaceId: 'aZJSPbcPw1cpdfYmtHM7za',
  },
];

const togglClientsPayload = [
  {
    id: 37389358,
    wid: 1738517,
    name: 'Client A',
    at: '2018-02-18T16:54:02+00:00',
  },
  {
    id: 19521509,
    wid: 1738517,
    name: 'Client B',
    at: '2016-12-06T03:48:38+00:00',
  },
  {
    id: 21773956,
    wid: 1738517,
    name: 'Client C',
    at: '2017-04-26T14:18:07+00:00',
  },
];

describe('clientsReducer', () => {
  cases(
    'state matches snapshot for fetch actions',
    options => {
      const result = clientsReducer(
        initialState,
        options.action(options.payload),
      );

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: 'when clockifyClientsFetch.request is dispatched',
        action: clientsActions.clockifyClientsFetch.request,
        payload: undefined,
      },
      {
        name: 'when clockifyClientsFetch.success is dispatched',
        action: clientsActions.clockifyClientsFetch.success,
        payload: clockifyClientsPayload,
      },
      {
        name: 'when clockifyClientsFetch.failure is dispatched',
        action: clientsActions.clockifyClientsFetch.failure,
        payload: undefined,
      },
      {
        name: 'when clockifyClientsTransfer.request is dispatched',
        action: clientsActions.clockifyClientsTransfer.request,
        payload: undefined,
      },
      {
        name: 'when clockifyClientsTransfer.success is dispatched',
        action: clientsActions.clockifyClientsTransfer.success,
        payload: clockifyClientsPayload,
      },
      {
        name: 'when clockifyClientsTransfer.failure is dispatched',
        action: clientsActions.clockifyClientsTransfer.failure,
        payload: undefined,
      },
      {
        name: 'when togglClientsFetch.request is dispatched',
        action: clientsActions.togglClientsFetch.request,
        payload: undefined,
      },
      {
        name: 'when togglClientsFetch.success is dispatched',
        action: clientsActions.togglClientsFetch.success,
        payload: togglClientsPayload,
      },
      {
        name: 'when togglClientsFetch.failure is dispatched',
        action: clientsActions.togglClientsFetch.failure,
        payload: undefined,
      },
    ],
  );

  cases(
    'sets isFetching = true',
    options => {
      const result = clientsReducer(
        { ...initialState, isFetching: false },
        options.action(),
      );

      expect(result.isFetching).toBe(true);
    },
    [
      {
        name: 'when clockifyClientsFetch.request is dispatched',
        action: clientsActions.clockifyClientsFetch.request,
      },
      {
        name: 'when clockifyClientsTransfer.request is dispatched',
        action: clientsActions.clockifyClientsTransfer.request,
      },
      {
        name: 'when togglClientsFetch.request is dispatched',
        action: clientsActions.togglClientsFetch.request,
      },
    ],
  );

  cases(
    'sets isFetching = false',
    options => {
      const result = clientsReducer(
        { ...initialState, isFetching: true },
        options.action(options.payload),
      );

      expect(result.isFetching).toBe(false);
    },
    [
      {
        name: 'when clockifyClientsFetch.success is dispatched',
        action: clientsActions.clockifyClientsFetch.success,
        payload: clockifyClientsPayload,
      },
      {
        name: 'when clockifyClientsFetch.failure is dispatched',
        action: clientsActions.clockifyClientsFetch.failure,
        payload: undefined,
      },
      {
        name: 'when clockifyClientsTransfer.success is dispatched',
        action: clientsActions.clockifyClientsTransfer.success,
        payload: clockifyClientsPayload,
      },
      {
        name: 'when clockifyClientsTransfer.failure is dispatched',
        action: clientsActions.clockifyClientsTransfer.failure,
        payload: undefined,
      },
      {
        name: 'when togglClientsFetch.success is dispatched',
        action: clientsActions.togglClientsFetch.success,
        payload: togglClientsPayload,
      },
      {
        name: 'when togglClientsFetch.failure is dispatched',
        action: clientsActions.togglClientsFetch.failure,
        payload: undefined,
      },
    ],
  );

  test('flips isIncluded when flipIsClientIncluded is dispatched', () => {
    const CLIENT_ID = 'ir4aN5VF7pdfDrgWjGCxeR';
    const testState = {
      ...initialState,
      toggl: {
        ...initialState.toggl,
        byId: {
          [CLIENT_ID]: {
            entryCount: 0,
            id: CLIENT_ID,
            isIncluded: false,
            linkedId: '',
            name: 'Client B',
            workspaceId: 'aZJSPbcPw1cpdfYmtHM7za',
          },
        },
      },
    };
    const result = clientsReducer(
      testState,
      clientsActions.flipIsClientIncluded(CLIENT_ID),
    );

    expect(result.toggl.byId[CLIENT_ID].isIncluded).toBe(true);
  });
});

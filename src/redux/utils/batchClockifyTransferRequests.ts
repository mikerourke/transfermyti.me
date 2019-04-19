import { flatten, get } from 'lodash';
import { buildThrottler } from './buildThrottler';
import { EntityGroup, ReduxDispatch } from '~/types';
import { updateInTransferDetails } from '~/redux/app/appActions';

interface Params<TEntity, TResponse> {
  requestsPerSecond: number;
  dispatch: ReduxDispatch;
  entityGroup: EntityGroup;
  entityRecordsInWorkspace: Array<TEntity>;
  apiFunc: (...args: Array<any>) => Promise<TResponse>;
  workspaceId: string;
}

interface FetchErrorModel {
  name: string;
  message: string;
}

/**
 * Loops through the specified records and performs the specified API function
 * that transfers each one to Clockify.
 */
export async function batchClockifyTransferRequests<TEntity, TResponse>({
  requestsPerSecond,
  dispatch,
  entityGroup,
  entityRecordsInWorkspace,
  apiFunc,
  workspaceId,
}: Params<TEntity, TResponse>): Promise<Array<TResponse>> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    requestsPerSecond,
    apiFunc,
  );

  const fetchResults: Array<TResponse> = [];
  const fetchErrors: Array<FetchErrorModel> = [];

  const countTotal = entityRecordsInWorkspace.length;
  let countCurrent = 1;

  for (const entityRecord of entityRecordsInWorkspace) {
    // Update state with the details of the in-transfer entity record:
    dispatch(
      updateInTransferDetails({
        countTotal,
        countCurrent,
        entityGroup,
        workspaceId,
        entityRecord,
      }),
    );

    try {
      await promiseThrottle
        // @ts-ignore
        .add(throttledFunc.bind(this, workspaceId, entityRecord))
        .then((result: TResponse) => {
          fetchResults.push(result);
        });
    } catch (error) {
      fetchErrors.push({
        name: get(entityRecord, 'name'),
        message: error.statusText,
      });
    }

    countCurrent += 1;
  }

  displayFetchErrors(fetchErrors);

  return flatten(fetchResults);
}

// TODO: Change this to return and render in component.
function displayFetchErrors(fetchErrors: Array<FetchErrorModel>) {
  if (fetchErrors.length === 0) return;

  // Let the user know there was some issues without holding up the whole
  // kit and caboodle:
  console.error('The following errors occurred:');
  fetchErrors.forEach(fetchError => {
    console.dir(fetchError);
  });
}

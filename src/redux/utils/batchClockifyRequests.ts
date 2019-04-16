import { flatten, get } from 'lodash';
import { updateTransferDetails } from '~/redux/app/appActions';
import { buildThrottler } from './buildThrottler';
import { ReduxDispatch } from '~/types';

/**
 * Loops through the specified records and performs the specified API function
 * on each one in global state.
 * @param requestsPerSecond Maximum number of fetch calls per second (to
 *                          prevent API errors).
 * @param dispatch Redux dispatch used to update the in-transfer entity.
 * @param entityRecordsInWorkspace Array of request body records associated
 *                                 with workspace.
 * @param clockifyApiFunc API function to call for each request body.
 * @param parentIds Parent ID values to call API function.
 */
export async function batchClockifyRequests<TPayload, TResponse>(
  requestsPerSecond: number,
  dispatch: ReduxDispatch,
  entityRecordsInWorkspace: Array<TPayload>,
  clockifyApiFunc: (...args: Array<any>) => Promise<TResponse>,
  ...parentIds: Array<string>
): Promise<Array<TResponse>> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    requestsPerSecond,
    clockifyApiFunc,
  );

  const fetchResults: Array<TResponse> = [];
  const fetchErrors: Array<{ name: string; message: string }> = [];
  let recordNumber = 1;

  for (const entityRecord of entityRecordsInWorkspace) {
    try {
      dispatch(
        updateTransferDetails({
          countCurrent: recordNumber,
          countTotal: entityRecordsInWorkspace.length,
          inTransferEntity: entityRecord,
        }),
      );

      await promiseThrottle
        // @ts-ignore
        .add(throttledFunc.bind(this, ...parentIds, entityRecord))
        .then((result: TResponse) => {
          fetchResults.push(result);
        });
    } catch (error) {
      fetchErrors.push({
        name: get(entityRecord, 'name'),
        message: error.statusText,
      });
    }

    recordNumber += 1;
  }

  // TODO: Change this to return and render in component.
  // Let the user know there was some issues without holding up the whole
  // kit and caboodle:
  if (fetchErrors.length !== 0) {
    console.error('The following errors occurred:');
    fetchErrors.forEach(fetchError => {
      console.dir(fetchError);
    });
  }

  return flatten(fetchResults);
}

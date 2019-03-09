import { flatten, get } from 'lodash';
import buildThrottler from './buildThrottler';

/**
 * Loops through the specified records and performs the specified API function
 *    on each one.
 * @param entityRecordsInWorkspace Array of request body records associated
 *    with workspace.
 * @param clockifyApiFn API function to call for each request body.
 * @param parentIds Parent ID values to call API function.
 * @returns {Promise<*>}
 */
export default async function batchClockifyRequests<TPayload, TResponse>(
  entityRecordsInWorkspace: TPayload[],
  clockifyApiFn: (...args: any[]) => Promise<TResponse>,
  ...parentIds: string[]
): Promise<TResponse[]> {
  const { promiseThrottle, throttledFn } = buildThrottler(clockifyApiFn);

  const fetchResults: TResponse[] = [];
  const fetchErrors: { name: string; message: string }[] = [];

  for (const entityRecord of entityRecordsInWorkspace) {
    try {
      await promiseThrottle
        // @ts-ignore
        .add(throttledFn.bind(this, ...parentIds, entityRecord))
        .then((result: TResponse) => {
          fetchResults.push(result);
        });
    } catch (error) {
      fetchErrors.push({
        name: get(entityRecord, 'name'),
        message: error.statusText,
      });
    }
  }

  // TODO: Change this to return and render in component.
  // Let the user know there was some issues without holding up the whole
  // kit and caboodle:
  if (fetchErrors.length !== 0) {
    console.log('The following errors occurred:');
    fetchErrors.forEach(fetchError => {
      console.dir(fetchError);
    });
  }

  return flatten(fetchResults);
}

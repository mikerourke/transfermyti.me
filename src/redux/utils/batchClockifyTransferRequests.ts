import { flatten, get } from "lodash";
import { buildThrottler } from "./buildThrottler";
import { EntityGroup, ReduxDispatch } from "~/types";
import { updateInTransferDetails } from "~/redux/app/appActions";

interface Params<TEntity, TResponse> {
  requestsPerSecond: number;
  dispatch: ReduxDispatch;
  entityGroup: EntityGroup;
  entityRecordsInWorkspace: Array<TEntity>;
  apiFunc: (...args: Array<any>) => Promise<TResponse>;
  clockifyWorkspaceId: string;
  togglWorkspaceId: string;
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
  clockifyWorkspaceId,
  togglWorkspaceId,
}: Params<TEntity, TResponse>): Promise<Array<TResponse>> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    requestsPerSecond,
    apiFunc,
  );

  const fetchResults: Array<TResponse> = [];
  const fetchErrors: Array<FetchErrorModel> = [];

  const countTotalInGroup = entityRecordsInWorkspace.length;
  let countCurrentInGroup = 1;

  for (const entityRecord of entityRecordsInWorkspace) {
    // Update state with the details of the in-transfer entity record.
    // We want to use the Toggl workspace ID since it ensures we're able to
    // get the corresponding data easily out of state and not rely on the
    // Clockify entities existing:
    const inTransferDetails = {
      countTotalInGroup,
      countCurrentInGroup,
      entityGroup,
      workspaceId: togglWorkspaceId,
    };

    try {
      await promiseThrottle
        // @ts-ignore
        .add(throttledFunc.bind(this, clockifyWorkspaceId, entityRecord))
        .then((result: TResponse) => {
          fetchResults.push(result);
          dispatch(updateInTransferDetails(inTransferDetails));
        });
    } catch (error) {
      fetchErrors.push({
        name: get(entityRecord, "name"),
        message: error.statusText,
      });
    }

    countCurrentInGroup += 1;
  }

  displayFetchErrors(fetchErrors);

  return flatten(fetchResults);
}

// TODO: Change this to return and render in component.
function displayFetchErrors(fetchErrors: Array<FetchErrorModel>) {
  if (fetchErrors.length === 0) return;

  // Let the user know there was some issues without holding up the whole
  // kit and caboodle:
  console.error("The following errors occurred:");
  fetchErrors.forEach(fetchError => {
    console.dir(fetchError);
  });
}

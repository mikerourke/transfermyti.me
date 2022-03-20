import ReactGA from "react-ga";
import { Dispatch, Middleware } from "redux";
import { isActionOf } from "typesafe-actions";

import {
  createAllEntities,
  deleteAllEntities,
  fetchAllEntities,
  flipIfExistsInTargetShown,
  updateToolAction,
  updateToolNameByMapping,
} from "~/modules/allEntities/allEntitiesActions";
import {
  areExistsInTargetShownSelector,
  toolNameByMappingSelector,
  totalIncludedRecordsCountSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import {
  AnalyticsEventCategory,
  ReduxAction,
  ReduxStore,
  ToolNameByMappingModel,
} from "~/typeDefs";

export const analyticsMiddleware = createAnalyticsMiddleware();

let fetchStartTime = Date.now();

/**
 * Listens for dispatched actions that could benefit from analytics and send
 * the appropriate events to GA.
 */
function createAnalyticsMiddleware(): Middleware {
  const middleware =
    (store: ReduxStore) =>
    (next: Dispatch) =>
    (action: ReduxAction<unknown>) => {
      if (
        !isActionOf(
          [
            // These are useful for determining how long the fetch/delete/transfer
            // action takes. If it's taking a super long time (relative to the
            // record count), is it a rate limiting issue? I believe there are
            // endpoints that can handle bulk updates/fetches, so it might be
            // worth it to explore them more:
            createAllEntities.request,
            createAllEntities.success,
            deleteAllEntities.request,
            deleteAllEntities.success,
            fetchAllEntities.request,
            fetchAllEntities.success,
            // How often are users flipping this button? Do they want to see the
            // included records, or for the most part are they starting with a
            // clean slate?
            flipIfExistsInTargetShown,
            // These are the most important. What action are they performing and
            // what is the direction of transfer?
            updateToolAction,
            updateToolNameByMapping,
          ],
          action,
        )
      ) {
        return next(action);
      }

      const state = store.getState();
      const { source, target } = toolNameByMappingSelector(state);
      const recordCount = totalIncludedRecordsCountSelector(state);

      switch (true) {
        case isActionOf(createAllEntities.request, action): {
          fetchStartTime = Date.now();

          ReactGA.event({
            category: AnalyticsEventCategory.ApiRequests,
            action: "Start Creation",
            label: `Source: ${source}, Target: ${target}`,
            value: recordCount,
          });
          break;
        }

        case isActionOf(createAllEntities.success, action): {
          ReactGA.event({
            category: AnalyticsEventCategory.ApiRequests,
            action: "Finish Creation",
            label: `Source: ${source}, Target: ${target}`,
            value: Date.now() - fetchStartTime,
          });
          break;
        }

        case isActionOf(deleteAllEntities.request, action):
          fetchStartTime = Date.now();

          ReactGA.event({
            category: AnalyticsEventCategory.ApiRequests,
            action: "Start Deletion",
            label: `Source: ${source}, Target: ${target}`,
            value: recordCount,
          });
          break;

        case isActionOf(deleteAllEntities.success, action): {
          ReactGA.event({
            category: AnalyticsEventCategory.ApiRequests,
            action: "Finish Deletion",
            label: `Source: ${source}, Target: ${target}`,
            value: Date.now() - fetchStartTime,
          });
          break;
        }

        case isActionOf(fetchAllEntities.request, action): {
          fetchStartTime = Date.now();

          ReactGA.event({
            category: AnalyticsEventCategory.ApiRequests,
            action: "Start Fetch",
            label: `Source: ${source}, Target: ${target}`,
          });
          break;
        }

        case isActionOf(fetchAllEntities.success, action): {
          ReactGA.event({
            category: AnalyticsEventCategory.ApiRequests,
            action: "Finish Fetch",
            label: `Source: ${source}, Target: ${target}`,
            value: Date.now() - fetchStartTime,
          });
          break;
        }

        case isActionOf(flipIfExistsInTargetShown, action): {
          const areShown = areExistsInTargetShownSelector(store.getState());
          ReactGA.event({
            category: AnalyticsEventCategory.UIInteraction,
            action: "Toggle Existing Shown",
            // Need to set it to the opposite value (since state hasn't been
            // updated yet):
            label: `Value: ${!areShown}`,
          });
          break;
        }

        case isActionOf(updateToolAction, action):
          ReactGA.event({
            category: AnalyticsEventCategory.ToolAction,
            action: "Picked",
            label: action.payload as string,
          });
          break;

        case isActionOf(updateToolNameByMapping, action): {
          const payload = action.payload as ToolNameByMappingModel;
          ReactGA.event({
            category: AnalyticsEventCategory.ToolMapping,
            action: "Picked",
            label: `Source: ${payload.source}, Target: ${payload.target}`,
          });
          break;
        }

        default:
          break;
      }

      return next(action);
    };

  return middleware as Middleware;
}

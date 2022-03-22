import { navigate } from "svelte-routing";

import { routePathChanged } from "~/modules/app/appActions";
import { dispatchAction } from "~/redux/reduxToStore";
import type { RoutePath } from "~/typeDefs";

export function navigateToRoute(
  routePath: RoutePath,
  options?: { replace?: boolean },
): void {
  dispatchAction(routePathChanged(routePath));

  navigate(routePath, options);
}

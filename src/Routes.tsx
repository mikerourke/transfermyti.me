/* eslint-disable import/no-unresolved */
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import React from "react";
import { Redirect, Route, Switch } from "react-router";

import AppRoot from "~/layout/AppRoot";
import EnterApiKeysStep from "~/pages/enterApiKeysStep/EnterApiKeysStep";
import PerformToolActionStep from "~/pages/performToolActionStep/PerformToolActionStep";
import PickToolActionStep from "~/pages/pickToolActionStep/PickToolActionStep";
import SelectInclusionsStep from "~/pages/selectInclusionsStep/SelectInclusionsStep";
import SelectSourceWorkspacesStep from "~/pages/selectSourceWorkspacesStep/SelectSourceWorkspacesStep";
import ToolActionSuccess from "~/pages/toolActionSuccess/ToolActionSuccess";
import { RoutePath } from "~/typeDefs";

interface Props {
  history: History;
}

const Routes: React.FC<Props> = ({ history }) => (
  <ConnectedRouter history={history}>
    <AppRoot>
      <Switch>
        <Redirect exact from="/" to={RoutePath.PickToolAction} />
        <Route path={RoutePath.PickToolAction} component={PickToolActionStep} />
        <Route path={RoutePath.EnterApiKeys} component={EnterApiKeysStep} />
        <Route
          path={RoutePath.SelectWorkspaces}
          component={SelectSourceWorkspacesStep}
        />
        <Route
          path={RoutePath.SelectInclusions}
          component={SelectInclusionsStep}
        />
        <Route
          path={RoutePath.PerformToolAction}
          component={PerformToolActionStep}
        />
        <Route
          path={RoutePath.ToolActionSuccess}
          component={ToolActionSuccess}
        />
      </Switch>
    </AppRoot>
  </ConnectedRouter>
);

export default Routes;

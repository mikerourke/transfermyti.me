import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import AppRoot from "~/app/appRoot/AppRoot";
import PickToolActionStep from "~/app/pickToolActionStep/PickToolActionStep";
import EnterApiKeysStep from "~/credentials/enterApiKeysStep/EnterApiKeysStep";
import SelectSourceWorkspacesStep from "~/workspaces/selectSourceWorkspacesStep/SelectSourceWorkspacesStep";
import SelectInclusionsStep from "~/allEntities/selectInclusionsStep/SelectInclusionsStep";
import PerformToolActionStep from "~/allEntities/performToolActionStep/PerformToolActionStep";
import ToolActionSuccess from "~/app/toolActionSuccess/ToolActionSuccess";
import { RoutePath } from "~/app/appTypes";

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

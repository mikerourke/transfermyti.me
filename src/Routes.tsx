import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import React from "react";
import { Redirect, Route, Switch } from "react-router";
import AppRoot from "~/app/appRoot/AppRoot";
import PickTransferActionStep from "~/app/pickTransferActionStep/PickTransferActionStep";
import EnterApiKeysStep from "~/credentials/enterApiKeysStep/EnterApiKeysStep";
import SelectSourceWorkspacesStep from "~/workspaces/selectSourceWorkspacesStep/SelectSourceWorkspacesStep";
import SelectTransferDataStep from "~/allEntities/selectTransferDataStep/SelectTransferDataStep";
import PerformTransferStep from "~/allEntities/performTransferStep/PerformTransferStep";
import { RoutePath } from "~/app/appTypes";

interface Props {
  history: History;
}

const Routes: React.FC<Props> = ({ history }) => (
  <ConnectedRouter history={history}>
    <AppRoot>
      <Switch>
        <Redirect exact from="/" to={RoutePath.PickTransferAction} />
        <Route
          path={RoutePath.PickTransferAction}
          component={PickTransferActionStep}
        />
        <Route path={RoutePath.EnterApiKeys} component={EnterApiKeysStep} />
        <Route
          path={RoutePath.SelectWorkspaces}
          component={SelectSourceWorkspacesStep}
        />
        <Route
          path={RoutePath.SelectTransferData}
          component={SelectTransferDataStep}
        />
        <Route
          path={RoutePath.PerformTransfer}
          component={PerformTransferStep}
        />
      </Switch>
    </AppRoot>
  </ConnectedRouter>
);

export default Routes;

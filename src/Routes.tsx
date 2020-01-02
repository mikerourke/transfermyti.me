import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import { Redirect, Route, Switch } from "react-router";
import AppRoot from "~/app/appRoot/AppRoot";
import SelectTransferMappingStep from "~/app/selectTransferMappingStep/SelectTransferMappingStep";
import EnterCredentialsStep from "~/credentials/enterCredentialsStep/EnterCredentialsStep";
import SelectSourceWorkspacesStep from "~/workspaces/selectSourceWorkspacesStep/SelectSourceWorkspacesStep";
import SelectTransferDataStep from "~/allEntities/selectTransferDataStep/SelectTransferDataStep";
import { RoutePath } from "~/app/appTypes";

interface Props {
  history: History;
}

const Routes: React.FC<Props> = ({ history }) => (
  <ConnectedRouter history={history}>
    <AppRoot>
      <Switch>
        <Redirect exact from="/" to={RoutePath.PickTransferMapping} />
        <Route
          path={RoutePath.PickTransferMapping}
          component={SelectTransferMappingStep}
        />
        <Route
          path={RoutePath.EnterCredentials}
          component={EnterCredentialsStep}
        />
        <Route
          path={RoutePath.SelectWorkspaces}
          component={SelectSourceWorkspacesStep}
        />
        <Route
          path={RoutePath.SelectTransferData}
          component={SelectTransferDataStep}
        />
        />
      </Switch>
    </AppRoot>
  </ConnectedRouter>
);

export default Routes;

import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import { Redirect, Route, Switch } from "react-router";
import AppRoot from "~/app/appRoot/AppRoot";
import SelectTransferMappingStep from "~/app/selectTransferMappingStep/SelectTransferMappingStep";
import EnterCredentialsStep from "~/credentials/enterCredentialsStep/EnterCredentialsStep";
import SelectSourceWorkspacesStep from "~/workspaces/selectSourceWorkspacesStep/SelectSourceWorkspacesStep";
import SelectSourceInclusions from "~/common/selectSourceInclusions/SelectSourceInclusions";
import { RoutePath } from "~/app/appTypes";

interface Props {
  history: History;
}

const Routes: React.FC<Props> = ({ history }) => (
  <ConnectedRouter history={history}>
    <AppRoot>
      <Switch>
        <Redirect exact from="/" to={RoutePath.TransferMapping} />
        <Route
          path={RoutePath.TransferMapping}
          component={SelectTransferMappingStep}
        />
        <Route path={RoutePath.Credentials} component={EnterCredentialsStep} />
        <Route
          path={RoutePath.Workspaces}
          component={SelectSourceWorkspacesStep}
        />
        <Route
          path={RoutePath.ReviewSource}
          component={SelectSourceInclusions}
        />
      </Switch>
    </AppRoot>
  </ConnectedRouter>
);

export default Routes;

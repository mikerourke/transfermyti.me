import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { ConnectedRouter } from "connected-react-router";
import { History } from "history";
import AppRoot from "~/app/appRoot/AppRoot";
import { RoutePath } from "~/app/appTypes";
import SelectTransferTypeStep from "~/app/selectTransferTypeStep/SelectTransferTypeStep";
import EnterCredentialsStep from "~/credentials/enterCredentialsStep/EnterCredentialsStep";
import SelectSourceWorkspacesStep from "~/workspaces/selectSourceWorkspacesStep/SelectSourceWorkspacesStep";
import SelectSourceInclusions from "~/common/selectSourceInclusions/SelectSourceInclusions";

interface Props {
  history: History;
}

const Routes: React.FC<Props> = ({ history }) => (
  <ConnectedRouter history={history}>
    <AppRoot>
      <Switch>
        <Redirect exact from="/" to={RoutePath.TransferType} />
        <Route
          path={RoutePath.TransferType}
          component={SelectTransferTypeStep}
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

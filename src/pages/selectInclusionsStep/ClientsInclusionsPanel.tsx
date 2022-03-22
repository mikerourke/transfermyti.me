import React from "react";
import { connect } from "react-redux";
import type { PayloadActionCreator } from "typesafe-actions";

import { EntityGroupInclusionsPanel } from "~/components";
import {
  updateAreAllClientsIncluded,
  flipIsClientIncluded,
} from "~/modules/clients/clientsActions";
import {
  clientsForInclusionsTableSelector,
  clientsTotalCountsByTypeSelector,
} from "~/modules/clients/clientsSelectors";
import {
  EntityGroup,
  type ClientTableViewModel,
  type ReduxState,
} from "~/typeDefs";

interface ConnectStateProps {
  clients: ClientTableViewModel[];
  totalCountsByType: Record<string, number>;
}
interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ClientsInclusionsPanelComponent: React.FC<Props> = (props) => (
  <EntityGroupInclusionsPanel
    entityGroup={EntityGroup.Clients}
    rowNumber={1}
    tableData={props.clients}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entry Count", field: "entryCount" },
      { label: "Project Count", field: "projectCount" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
    onUpdateAreAllIncluded={props.onUpdateAreAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  clients: clientsForInclusionsTableSelector(state),
  totalCountsByType: clientsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsClientIncluded,
  onUpdateAreAllIncluded: updateAreAllClientsIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClientsInclusionsPanelComponent);

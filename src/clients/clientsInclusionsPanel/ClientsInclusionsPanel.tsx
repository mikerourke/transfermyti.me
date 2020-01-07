import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  updateAreAllClientsIncluded,
  flipIsClientIncluded,
} from "~/clients/clientsActions";
import {
  clientsForInclusionsTableSelector,
  clientsTotalCountsByTypeSelector,
} from "~/clients/clientsSelectors";
import { EntityGroupInclusionsPanel } from "~/components";
import { EntityGroup } from "~/allEntities/allEntitiesTypes";
import { ClientTableViewModel } from "~/clients/clientsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  clients: ClientTableViewModel[];
  totalCountsByType: Record<string, number>;
}
interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ClientsInclusionsPanelComponent: React.FC<Props> = props => (
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

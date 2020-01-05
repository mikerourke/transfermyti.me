import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  flipIsClientIncluded,
  updateIfAllClientsIncluded,
} from "~/clients/clientsActions";
import {
  clientsForTableViewSelector,
  clientsTotalCountsByTypeSelector,
} from "~/clients/clientsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup } from "~/allEntities/allEntitiesTypes";
import { ClientTableViewModel } from "~/clients/clientsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  clients: ClientTableViewModel[];
  totalCountsByType: Record<string, number>;
}
interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateIfAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ClientsTableComponent: React.FC<Props> = props => (
  <EntityListPanel
    entityGroup={EntityGroup.Clients}
    rowNumber={1}
    tableData={props.clients}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Project Count", field: "projectCount" },
      { label: "Time Entry Count", field: "entryCount" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
    onUpdateIfAllIncluded={props.onUpdateIfAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  clients: clientsForTableViewSelector(state),
  totalCountsByType: clientsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsClientIncluded,
  onUpdateIfAllIncluded: updateIfAllClientsIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClientsTableComponent);

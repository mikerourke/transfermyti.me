import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsClientIncluded } from "~/clients/clientsActions";
import { clientsForTableViewSelector } from "~/clients/clientsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ClientModel } from "~/clients/clientsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  clients: TableViewModel<ClientModel>[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ClientsTableComponent: React.FC<Props> = props => (
  <EntityListPanel
    entityGroup={EntityGroup.Clients}
    rowNumber={2}
    tableData={props.clients}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entries", field: "entryCount" },
    ]}
    onFlipIsIncluded={props.onFlipIsIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  clients: clientsForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsClientIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClientsTableComponent);

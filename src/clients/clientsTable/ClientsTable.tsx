import React from "react";
import { connect } from "react-redux";
import { Table, Checkbox } from "rsuite";
import { PayloadActionCreator } from "typesafe-actions";
import { fetchClients } from "~/clients/clientsActions";
import {
  selectSourceClientsInActiveWorkspace,
  selectIfClientsFetching,
} from "~/clients/clientsSelectors";
import { ClientModel } from "~/clients/clientsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  clients: ClientModel[];
  isFetching: boolean;
}

interface ConnectDispatchProps {
  onFetchClients: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ClientsTableComponent: React.FC<Props> = props => {
  React.useEffect(() => {
    if (props.clients.length === 0) {
      props.onFetchClients();
    }
  }, []);

  if (props.isFetching) {
    return null;
  }

  return (
    <div>
      <Table height={420} data={props.clients} autoHeight>
        <Table.Column width={100} align="center">
          <Table.HeaderCell>Include</Table.HeaderCell>
          <Table.Cell dataKey="id">
            {(rowData: ClientModel) => (
              <Checkbox inline checked={rowData.isIncluded} />
            )}
          </Table.Cell>
        </Table.Column>
        <Table.Column width={100} resizable>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.Cell dataKey="name" />
        </Table.Column>
      </Table>
    </div>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  clients: selectSourceClientsInActiveWorkspace(state),
  isFetching: selectIfClientsFetching(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchClients: fetchClients.request,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClientsTableComponent);

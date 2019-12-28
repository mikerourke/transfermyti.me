import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsClientIncluded } from "~/clients/clientsActions";
import { selectSourceClientsInActiveWorkspace } from "~/clients/clientsSelectors";
import { styled } from "~/components";
import { ClientModel } from "~/clients/clientsTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Table = styled.table({
  width: "100%",

  td: {
    padding: "0.5rem 0.25rem",
  },

  "thead td:first-of-type, tr td:first-of-type": {
    textAlign: "center",
    width: "5rem",
  },

  "thead td": {
    fontWeight: "bold",
  },

  "tbody td": {
    borderTop: "1px solid rgb(229, 229, 234);",
  },
});

interface ConnectStateProps {
  clients: ClientModel[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ClientsTableComponent: React.FC<Props> = props => {
  return (
    <Table>
      <thead>
        <tr>
          <td>Include?</td>
          <td>Name</td>
        </tr>
      </thead>
      <tbody>
        {props.clients.map(client => (
          <tr key={client.id}>
            <td>
              <input
                type="checkbox"
                checked={client.isIncluded}
                onChange={() => props.onFlipIsIncluded(client.id)}
              />
            </td>
            <td>{client.name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  clients: selectSourceClientsInActiveWorkspace(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsClientIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClientsTableComponent);

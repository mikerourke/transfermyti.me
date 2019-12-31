import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTimeEntryIncluded } from "~/timeEntries/timeEntriesActions";
import { timeEntriesForTableViewSelector } from "~/timeEntries/timeEntriesSelectors";
import { AccordionPanel, styled } from "~/components";
import { TableViewModel } from "~/allEntities/allEntitiesTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Table = styled.table({
  tableLayout: "fixed",
  width: "100%",

  th: {
    fontWeight: "bold",
    textAlign: "left",
  },

  td: {
    borderTop: "1px solid rgb(229, 229, 234);",
    padding: "0.5rem 0.25rem",
  },

  "tr th, tr td": {
    fontSize: "0.875rem",
  },

  "tr th:first-of-type, tr td:first-of-type": {
    textAlign: "center",
    width: "5rem",
  },
});

const TableBodyRow = styled.tr<{ existsInTarget: boolean }>(
  {},
  ({ existsInTarget, theme }) => ({
    td: {
      color: existsInTarget ? theme.colors.manatee : theme.colors.black,
      textDecoration: existsInTarget ? "line-through" : "none",
    },
  }),
);

interface ConnectStateProps {
  timeEntries: TableViewModel<TimeEntryModel>[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TimeEntriesTableComponent: React.FC<Props> = props => (
  <AccordionPanel
    rowNumber={5}
    title={<span>Time Entries | Count: {props.timeEntries.length}</span>}
  >
    <Table>
      <thead>
        <tr>
          <th>Include?</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.timeEntries.map(({ existsInTarget, ...timeEntry }) => (
          <TableBodyRow key={timeEntry.id} existsInTarget={existsInTarget}>
            <td rowSpan={2}>
              <input
                type="checkbox"
                checked={existsInTarget ? false : timeEntry.isIncluded}
                disabled={existsInTarget}
                onChange={() => props.onFlipIsIncluded(timeEntry.id)}
              />
            </td>
            <td>{timeEntry.description}</td>
            <td>{timeEntry.start.toISOString()}</td>
          </TableBodyRow>
        ))}
      </tbody>
    </Table>
  </AccordionPanel>
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  timeEntries: timeEntriesForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTimeEntryIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimeEntriesTableComponent);

import format from "date-fns/format";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { replaceMappingWithToolNameSelector } from "~/app/appSelectors";
import { flipIsTimeEntryIncluded } from "~/timeEntries/timeEntriesActions";
import {
  includedTimeEntriesTotalCountForTableViewSelector,
  timeEntriesForTableViewSelector,
} from "~/timeEntries/timeEntriesSelectors";
import {
  AccordionPanel,
  EntityListPanelTable,
  EntityListPanelTableRow,
} from "~/components";
import { ReduxState } from "~/redux/reduxTypes";
import { TimeEntryTableViewModel } from "~/timeEntries/timeEntriesTypes";

interface ConnectStateProps {
  includedTotalCount: number;
  replaceMappingWithToolName: (label: string) => string;
  timeEntries: TimeEntryTableViewModel[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TimeEntriesTableComponent: React.FC<Props> = props => (
  <AccordionPanel rowNumber={5} title="Time Entries">
    <EntityListPanelTable>
      <caption>
        {props.replaceMappingWithToolName("Time Entry Records in Source")}
      </caption>
      <thead>
        <tr>
          <th scope="col">Start Time</th>
          <th scope="col">End Time</th>
          <th scope="col">Task</th>
          <th scope="col">Project</th>
          <th scope="col" className="include-cell" rowSpan={2}>
            Include in Transfer?
          </th>
        </tr>
        <tr>
          <th scope="col" colSpan={3}>
            Description
          </th>
          <th scope="col">Tags</th>
        </tr>
      </thead>
      <tbody>
        {props.timeEntries.map(({ existsInTarget, ...timeEntry }) => (
          <React.Fragment key={timeEntry.id}>
            <EntityListPanelTableRow existsInTarget={existsInTarget}>
              <td>{format(timeEntry.start, "Pp")}</td>
              <td>{format(timeEntry.end, "Pp")}</td>
              <td>{timeEntry.taskName}</td>
              <td>{timeEntry.projectName}</td>
              <td className="include-cell" rowSpan={2}>
                <input
                  type="checkbox"
                  checked={existsInTarget ? false : timeEntry.isIncluded}
                  disabled={existsInTarget}
                  onChange={() => props.onFlipIsIncluded(timeEntry.id)}
                />
              </td>
            </EntityListPanelTableRow>
            <EntityListPanelTableRow existsInTarget={existsInTarget}>
              <td colSpan={3}>{timeEntry.description}</td>
              <td>{timeEntry.tagNames.join(", ")}</td>
            </EntityListPanelTableRow>
          </React.Fragment>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th colSpan={4} style={{ textAlign: "right" }}>
            Total
          </th>
          <td style={{ textAlign: "center" }}>{props.includedTotalCount}</td>
        </tr>
      </tfoot>
    </EntityListPanelTable>
  </AccordionPanel>
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  includedTotalCount: includedTimeEntriesTotalCountForTableViewSelector(state),
  replaceMappingWithToolName: replaceMappingWithToolNameSelector(state),
  timeEntries: timeEntriesForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTimeEntryIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TimeEntriesTableComponent);

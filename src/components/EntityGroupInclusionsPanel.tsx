import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { replaceMappingWithToolNameSelector } from "~/app/appSelectors";
import { getEntityGroupDisplay } from "~/utils";
import AccordionPanel from "./AccordionPanel";
import InclusionsTable from "./InclusionsTable";
import InclusionsTableBody from "./InclusionsTableBody";
import InclusionsTableFoot from "./InclusionsTableFoot";
import InclusionsTableHead from "./InclusionsTableHead";
import InclusionsTableTitle from "./InclusionsTableTitle";
import {
  BaseEntityModel,
  EntityGroup,
  TableViewModel,
} from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  replaceMappingWithToolName: (label: string) => string;
}

interface OwnProps {
  entityGroup: EntityGroup;
  rowNumber: number;
  tableData: TableViewModel<BaseEntityModel>[];
  tableFields: { label: string; field: string }[];
  totalCountsByType: Record<string, number>;
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & OwnProps;

export const EntityGroupInclusionsPanelComponent: React.FC<Props> = props => {
  const areAllToggled =
    props.totalCountsByType.inclusions === props.tableData.length;

  const groupDisplay = getEntityGroupDisplay(props.entityGroup);
  const headerLabels: string[] = [];
  const bodyFieldNames: string[] = [];

  const handleFlipInclusions = (): void => {
    props.onUpdateAreAllIncluded(!areAllToggled);
  };

  for (const tableField of props.tableFields) {
    headerLabels.push(props.replaceMappingWithToolName(tableField.label));
    bodyFieldNames.push(tableField.field);
  }

  const tableTitleId = `${props.entityGroup}Desc`;
  const nonExistingRecords = props.tableData.filter(
    record => !record.existsInTarget,
  );
  const flipDisabled = nonExistingRecords.length === 0;

  return (
    <AccordionPanel rowNumber={props.rowNumber} title={groupDisplay}>
      <InclusionsTableTitle
        id={tableTitleId}
        flipDisabled={flipDisabled}
        onFlipAreAllIncluded={handleFlipInclusions}
      >
        {props.replaceMappingWithToolName(`${groupDisplay} Records in Source`)}
      </InclusionsTableTitle>
      <InclusionsTable aria-labelledby={tableTitleId}>
        <InclusionsTableHead labels={headerLabels} />
        <InclusionsTableBody
          fieldNames={bodyFieldNames}
          tableData={props.tableData}
          onFlipIsIncluded={props.onFlipIsIncluded}
        />
        <InclusionsTableFoot
          fieldCount={bodyFieldNames.length}
          totalCountsByType={props.totalCountsByType}
        />
      </InclusionsTable>
    </AccordionPanel>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  replaceMappingWithToolName: replaceMappingWithToolNameSelector(state),
});

export default connect<ConnectStateProps, {}, OwnProps, ReduxState>(
  mapStateToProps,
)(EntityGroupInclusionsPanelComponent);

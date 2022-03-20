import * as R from "ramda";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";

import { EntityGroupInclusionsPanel } from "~/components";
import { toolActionSelector } from "~/modules/allEntities/allEntitiesSelectors";
import {
  flipIsProjectIncluded,
  updateAreAllProjectsIncluded,
} from "~/modules/projects/projectsActions";
import {
  projectsForInclusionsTableSelector,
  projectsTotalCountsByTypeSelector,
} from "~/modules/projects/projectsSelectors";
import {
  EntityGroup,
  ProjectModel,
  ReduxState,
  TableViewModel,
  ToolAction,
} from "~/typeDefs";

interface ConnectStateProps {
  projects: TableViewModel<ProjectModel>[];
  toolAction: ToolAction;
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ProjectsInclusionsPanelComponent: React.FC<Props> = (props) => {
  // Only show the `isActiveInTarget` field if you're performing a transfer.
  // If the user is just deleting records, there is no "target":
  const tableFields = [
    { label: "Name", field: "name" },
    { label: "Time Entry Count", field: "entryCount" },
    { label: "Active in Source?", field: "isActiveInSource" },
  ];

  if (props.toolAction === ToolAction.Transfer) {
    tableFields.push({ label: "Active in Target?", field: "isActiveInTarget" });
  }

  // Only show the total for active in target if performing a transfer,
  // otherwise the columns will be off by 1:
  const totalCountsByType =
    props.toolAction === ToolAction.Transfer
      ? props.totalCountsByType
      : R.omit(["isActiveInTarget"], props.totalCountsByType);

  return (
    <EntityGroupInclusionsPanel
      entityGroup={EntityGroup.Projects}
      rowNumber={3}
      tableData={props.projects}
      tableFields={tableFields}
      totalCountsByType={totalCountsByType}
      onFlipIsIncluded={props.onFlipIsIncluded}
      onUpdateAreAllIncluded={props.onUpdateAreAllIncluded}
    />
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  projects: projectsForInclusionsTableSelector(state),
  toolAction: toolActionSelector(state),
  totalCountsByType: projectsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onUpdateAreAllIncluded: updateAreAllProjectsIncluded,
  onFlipIsIncluded: flipIsProjectIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectsInclusionsPanelComponent);

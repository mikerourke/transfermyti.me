import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  flipIsProjectIncluded,
  updateAreAllProjectsIncluded,
} from "~/projects/projectsActions";
import {
  projectsForInclusionsTableSelector,
  projectsTotalCountsByTypeSelector,
} from "~/projects/projectsSelectors";
import { EntityGroupInclusionsPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ProjectModel } from "~/projects/projectsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  projects: TableViewModel<ProjectModel>[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ProjectsInclusionsPanelComponent: React.FC<Props> = props => (
  <EntityGroupInclusionsPanel
    entityGroup={EntityGroup.Projects}
    rowNumber={3}
    tableData={props.projects}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entry Count", field: "entryCount" },
      { label: "Active in Source?", field: "isActiveInSource" },
      { label: "Active in Target?", field: "isActiveInTarget" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
    onUpdateAreAllIncluded={props.onUpdateAreAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  projects: projectsForInclusionsTableSelector(state),
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

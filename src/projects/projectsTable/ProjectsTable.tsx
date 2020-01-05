import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  flipIsProjectIncluded,
  updateIfAllProjectsIncluded,
} from "~/projects/projectsActions";
import {
  projectsForTableViewSelector,
  projectsTotalCountsByTypeSelector,
} from "~/projects/projectsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ProjectModel } from "~/projects/projectsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  projects: TableViewModel<ProjectModel>[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateIfAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ProjectsTableComponent: React.FC<Props> = props => (
  <EntityListPanel
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
    onUpdateIfAllIncluded={props.onUpdateIfAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  projects: projectsForTableViewSelector(state),
  totalCountsByType: projectsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsProjectIncluded,
  onUpdateIfAllIncluded: updateIfAllProjectsIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectsTableComponent);

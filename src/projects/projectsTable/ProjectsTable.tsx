import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsProjectIncluded } from "~/projects/projectsActions";
import { projectsForTableViewSelector } from "~/projects/projectsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ProjectModel } from "~/projects/projectsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  projects: TableViewModel<ProjectModel>[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ProjectsTableComponent: React.FC<Props> = props => (
  <EntityListPanel
    entityGroup={EntityGroup.Projects}
    rowNumber={1}
    tableData={props.projects}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entries", field: "entryCount" },
      { label: "Active In Source?", field: "isActiveInSource" },
      { label: "Active In Target?", field: "isActiveInTarget" },
    ]}
    onFlipIsIncluded={props.onFlipIsIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  projects: projectsForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsProjectIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectsTableComponent);

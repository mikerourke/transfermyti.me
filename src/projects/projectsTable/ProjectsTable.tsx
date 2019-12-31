import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsProjectIncluded } from "~/projects/projectsActions";
import { projectsForTableViewSelector } from "~/projects/projectsSelectors";
import { AccordionPanel, EntitiesTable } from "~/components";
import { TableViewModel } from "~/allEntities/allEntitiesTypes";
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
  <AccordionPanel
    rowNumber={1}
    title={<span>Projects | Count: {props.projects.length}</span>}
  >
    <EntitiesTable
      tableFields={[
        { label: "Name", field: "name" },
        { label: "Time Entry Count", field: "entryCount" },
        { label: "Active In Source?", field: "isActiveInSource" },
        { label: "Active In Target?", field: "isActiveInTarget" },
      ]}
      tableData={props.projects}
      onFlipIsIncluded={props.onFlipIsIncluded}
    />
  </AccordionPanel>
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

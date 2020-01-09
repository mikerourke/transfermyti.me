import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  updateAreAllTasksIncluded,
  flipIsTaskIncluded,
} from "~/tasks/tasksActions";
import {
  tasksForInclusionsTableSelector,
  tasksTotalCountsByTypeSelector,
} from "~/tasks/tasksSelectors";
import { EntityGroupInclusionsPanel } from "~/components";
import { EntityGroup, ReduxState, TableViewModel, TaskModel } from "~/typeDefs";

interface ConnectStateProps {
  tasks: TableViewModel<TaskModel & { projectName: string }>[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TasksInclusionsPanelComponent: React.FC<Props> = props => (
  <EntityGroupInclusionsPanel
    entityGroup={EntityGroup.Tasks}
    rowNumber={4}
    tableData={props.tasks}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Project", field: "projectName" },
      { label: "Time Entry Count", field: "entryCount" },
      { label: "Active In Source?", field: "isActiveInSource" },
      { label: "Active In Target?", field: "isActiveInTarget" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
    onUpdateAreAllIncluded={props.onUpdateAreAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tasks: tasksForInclusionsTableSelector(state),
  totalCountsByType: tasksTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTaskIncluded,
  onUpdateAreAllIncluded: updateAreAllTasksIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TasksInclusionsPanelComponent);

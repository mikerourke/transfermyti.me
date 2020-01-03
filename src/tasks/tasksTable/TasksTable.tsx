import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTaskIncluded } from "~/tasks/tasksActions";
import {
  tasksForTableViewSelector,
  tasksTotalCountsByTypeSelector,
} from "~/tasks/tasksSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { TaskModel } from "~/tasks/tasksTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  tasks: TableViewModel<TaskModel & { projectName: string }>[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TasksTableComponent: React.FC<Props> = props => (
  <EntityListPanel
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
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tasks: tasksForTableViewSelector(state),
  totalCountsByType: tasksTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTaskIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TasksTableComponent);

import * as R from "ramda";
import React from "react";
import { connect } from "react-redux";
import type { PayloadActionCreator } from "typesafe-actions";

import { EntityGroupInclusionsPanel } from "~/components";
import { toolActionSelector } from "~/modules/allEntities/allEntitiesSelectors";
import {
  updateAreAllTasksIncluded,
  flipIsTaskIncluded,
} from "~/modules/tasks/tasksActions";
import {
  tasksForInclusionsTableSelector,
  tasksTotalCountsByTypeSelector,
} from "~/modules/tasks/tasksSelectors";
import {
  EntityGroup,
  ToolAction,
  type ReduxState,
  type TableViewModel,
  type TaskModel,
} from "~/typeDefs";

interface ConnectStateProps {
  tasks: TableViewModel<TaskModel & { projectName: string }>[];
  toolAction: ToolAction;
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TasksInclusionsPanelComponent: React.FC<Props> = (props) => {
  // Only show the `isActiveInTarget` field if you're performing a transfer.
  // If the user is just deleting records, there is no "target":
  const tableFields = [
    { label: "Name", field: "name" },
    { label: "Project", field: "projectName" },
    { label: "Time Entry Count", field: "entryCount" },
    { label: "Active In Source?", field: "isActiveInSource" },
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
      entityGroup={EntityGroup.Tasks}
      rowNumber={4}
      tableData={props.tasks}
      tableFields={tableFields}
      totalCountsByType={totalCountsByType}
      onFlipIsIncluded={props.onFlipIsIncluded}
      onUpdateAreAllIncluded={props.onUpdateAreAllIncluded}
    />
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tasks: tasksForInclusionsTableSelector(state),
  toolAction: toolActionSelector(state),
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

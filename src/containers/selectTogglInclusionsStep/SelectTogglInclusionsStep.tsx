import React, { useEffect } from "react";
import { connect } from "react-redux";
import { If, Then, Else } from "react-if";
import { isNil } from "lodash";
import {
  fetchTogglEntitiesInWorkspace,
  flipIsWorkspaceEntityIncluded,
  updateIsWorkspaceYearIncluded,
} from "~/workspaces/workspacesActions";
import {
  selectTogglEntitiesByGroupByWorkspace,
  selectTogglCountsByGroupByWorkspace,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from "~/workspaces/workspacesSelectors";
import { EntitiesReviewPage, Loader, StepPageProps } from "~/components";
import InstructionsList from "./InstructionsList";
import { CompoundEntityModel, EntityGroup, ToolName } from "~/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  CompoundWorkspaceModel,
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
  UpdateIncludedWorkspaceYearModel,
} from "~/workspaces/workspacesTypes";

interface ConnectStateProps {
  countsByGroupByWorkspace: CountsByGroupByWorkspaceModel;
  entitiesByGroupByWorkspace: EntitiesByGroupByWorkspaceModel;
  workspaceNameBeingFetched: string;
  workspacesById: Record<string, CompoundWorkspaceModel>;
}

interface ConnectDispatchProps {
  onFetchEntitiesForWorkspace: (
    workspaceRecord: CompoundWorkspaceModel,
  ) => void;
  onFlipIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: CompoundEntityModel,
  ) => void;
  onUpdateIsWorkspaceYearIncluded: (
    updateDetails: UpdateIncludedWorkspaceYearModel,
  ) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const SelectTogglInclusionsStepComponent: React.FC<Props> = ({
  workspaceNameBeingFetched,
  workspacesById,
  onFetchEntitiesForWorkspace,
  ...props
}) => {
  const fetchEntitiesForAllWorkspaces = async (): Promise<void> => {
    const workspaceRecords = Object.values(workspacesById);
    for (const workspaceRecord of workspaceRecords) {
      await onFetchEntitiesForWorkspace(workspaceRecord);
    }
  };

  useEffect(() => {
    fetchEntitiesForAllWorkspaces();
  }, []);

  return (
    <If condition={isNil(workspaceNameBeingFetched)}>
      <Then>
        <EntitiesReviewPage
          subtitle="Select Toggl Records to Transfer"
          toolName={ToolName.Toggl}
          workspacesById={workspacesById}
          onRefreshClick={fetchEntitiesForAllWorkspaces}
          instructions={
            <>
              <p css={{ marginBottom: "1rem" }}>
                Select which entities/records you want to transfer and press the
                <strong> Next</strong> button when you&apos;re ready to move
                onto the next step. There are a few things to be aware of:
              </p>
              <InstructionsList />
              <p css={{ marginTop: "1rem" }}>
                If you need to change what&apos;s included in a different
                workspace, you can select it from the dropdown to the right of
                the entity tabs. Don&apos;t worry, all of your changes are
                preserved for all workspaces.
              </p>
            </>
          }
          {...props}
        />
      </Then>
      <Else>
        <Loader>
          Fetching entities in <strong>{workspaceNameBeingFetched} </strong>
          workspace...
        </Loader>
      </Else>
    </If>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  countsByGroupByWorkspace: selectTogglCountsByGroupByWorkspace(state),
  entitiesByGroupByWorkspace: selectTogglEntitiesByGroupByWorkspace(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
  workspacesById: selectTogglIncludedWorkspacesById(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchEntitiesForWorkspace: fetchTogglEntitiesInWorkspace,
  onFlipIsWorkspaceEntityIncluded: flipIsWorkspaceEntityIncluded,
  onUpdateIsWorkspaceYearIncluded: updateIsWorkspaceYearIncluded,
};

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglInclusionsStepComponent);

import { push } from "connected-react-router";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  fetchAllEntities,
  updateFetchAllFetchStatus,
} from "~/allEntities/allEntitiesActions";
import {
  toolActionSelector,
  targetToolDisplayNameSelector,
} from "~/allEntities/allEntitiesSelectors";
import { dismissAllNotifications, showNotification } from "~/app/appActions";
import {
  fetchWorkspaces,
  flipIsWorkspaceIncluded,
  updateActiveWorkspaceId,
  updateWorkspaceLinking,
} from "~/workspaces/workspacesActions";
import {
  areWorkspacesFetchingSelector,
  firstIncludedWorkspaceIdSelector,
  hasDuplicateTargetWorkspacesSelector,
  missingTargetWorkspacesSelector,
  sourceIncludedWorkspacesCountSelector,
  sourceWorkspacesSelector,
  targetWorkspacesSelector,
} from "~/workspaces/workspacesSelectors";
import {
  Button,
  Flex,
  HelpDetails,
  Loader,
  NavigationButtonsRow,
  Note,
} from "~/components";
import DuplicateTargetsModal from "./DuplicateTargetsModal";
import MissingWorkspacesModal from "./MissingWorkspacesModal";
import NoWorkspacesModal from "./NoWorkspacesModal";
import SourceWorkspaceCard from "./SourceWorkspaceCard";
import {
  FetchStatus,
  NotificationModel,
  ReduxState,
  RoutePath,
  ToolAction,
  WorkspaceModel,
} from "~/typeDefs";

interface ConnectStateProps {
  areWorkspacesFetching: boolean;
  firstIncludedWorkspaceId: string;
  hasDuplicateTargetWorkspaces: boolean;
  includedWorkspacesCount: number;
  missingTargetWorkspaces: WorkspaceModel[];
  sourceWorkspaces: WorkspaceModel[];
  targetToolDisplayName: string;
  targetWorkspaces: WorkspaceModel[];
  toolAction: ToolAction;
}

interface ConnectDispatchProps {
  onDismissAllNotifications: VoidFunction;
  onFetchAllEntities: PayloadActionCreator<string, void>;
  onFetchWorkspaces: PayloadActionCreator<string, void>;
  onFlipIsWorkspaceIncluded: (workspace: WorkspaceModel) => void;
  onPush: (path: RoutePath) => void;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
  onUpdateActiveWorkspaceId: (workspaceId: string) => void;
  onUpdateFetchAllFetchStatus: PayloadActionCreator<string, FetchStatus>;
  onUpdateWorkspaceLinking: (newValues: {
    sourceId: string;
    targetId: string | null;
  }) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectSourceWorkspacesStepComponent: React.FC<Props> = props => {
  const [isNoSelectionsModalOpen, setIsNoSelectionsModalOpen] = React.useState<
    boolean
  >(false);
  const [
    isMissingWorkspacesModalOpen,
    setIsMissingWorkspacesModalOpen,
  ] = React.useState<boolean>(false);
  const [
    isDuplicateTargetsModalOpen,
    setIsDuplicateTargetsModalOpen,
  ] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (props.sourceWorkspaces.length === 0) {
      props.onFetchWorkspaces();
    }
  }, []);

  const handleSelectTargetForSource = (
    sourceWorkspace: WorkspaceModel,
    targetWorkspace: WorkspaceModel,
  ): void => {
    props.onUpdateWorkspaceLinking({
      sourceId: sourceWorkspace.id,
      targetId: targetWorkspace?.id || null,
    });
  };

  const handleBackClick = (): void => {
    props.onPush(RoutePath.EnterApiKeys);
  };

  const handleNextClick = (): void => {
    if (
      props.missingTargetWorkspaces.length !== 0 &&
      props.toolAction === ToolAction.Transfer
    ) {
      setIsMissingWorkspacesModalOpen(true);
      return;
    }

    if (props.includedWorkspacesCount === 0) {
      setIsNoSelectionsModalOpen(true);
      return;
    }

    if (props.hasDuplicateTargetWorkspaces) {
      setIsDuplicateTargetsModalOpen(true);
      return;
    }

    props.onUpdateActiveWorkspaceId(props.firstIncludedWorkspaceId);
    props.onUpdateFetchAllFetchStatus(FetchStatus.Pending);
    props.onPush(RoutePath.SelectInclusions);
  };

  return (
    <section>
      <h1>Step 3: Select Workspaces</h1>
      <HelpDetails>
        <p>
          Toggle which workspaces you would like to include in the
          deletion/transfer and press the <strong>Next</strong> button to move
          on to the inclusions selection step.
        </p>
        {props.toolAction === ToolAction.Transfer && (
          <p>
            Once a workspace is toggled, you must select a target workspace for
            transfer (if workspaces exist on the target tool) from the
            <strong> Target Workspace</strong> dropdown. If you&apos;re
            transferring to Toggl, you must create the workspaces first.
          </p>
        )}
        <p>
          If you decide you want to include additional workspaces, you&apos;ll
          need to come back to this page and select them, otherwise the
          corresponding data won&apos;t be fetched.
        </p>
        <Note>
          Only select the workspaces containing data you wish to update. The
          fetch process can take several minutes depending on the amount of data
          in each workspace.
        </Note>
      </HelpDetails>
      {props.areWorkspacesFetching ? (
        <Loader>Loading workspaces, please wait...</Loader>
      ) : (
        <Flex as="ul" css={{ listStyle: "none", padding: 0 }} flexWrap="wrap">
          {props.sourceWorkspaces.map(workspace => (
            <SourceWorkspaceCard
              key={workspace.id}
              sourceWorkspace={workspace}
              targetWorkspaces={props.targetWorkspaces}
              toolAction={props.toolAction}
              onSelectTarget={handleSelectTargetForSource}
              onToggleIncluded={props.onFlipIsWorkspaceIncluded}
            />
          ))}
        </Flex>
      )}
      <NavigationButtonsRow
        css={{ marginTop: 0 }}
        disabled={props.areWorkspacesFetching}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      >
        <Button
          variant="eggplant"
          disabled={props.areWorkspacesFetching}
          onClick={() => props.onFetchWorkspaces()}
        >
          Refresh
        </Button>
      </NavigationButtonsRow>
      <NoWorkspacesModal
        isOpen={isNoSelectionsModalOpen}
        onClose={() => setIsNoSelectionsModalOpen(false)}
      />
      <MissingWorkspacesModal
        isOpen={isMissingWorkspacesModalOpen}
        targetToolDisplayName={props.targetToolDisplayName}
        workspaces={props.missingTargetWorkspaces}
        onClose={() => setIsMissingWorkspacesModalOpen(false)}
      />
      <DuplicateTargetsModal
        isOpen={isDuplicateTargetsModalOpen}
        onClose={() => setIsDuplicateTargetsModalOpen(false)}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areWorkspacesFetching: areWorkspacesFetchingSelector(state),
  firstIncludedWorkspaceId: firstIncludedWorkspaceIdSelector(state),
  hasDuplicateTargetWorkspaces: hasDuplicateTargetWorkspacesSelector(state),
  includedWorkspacesCount: sourceIncludedWorkspacesCountSelector(state),
  missingTargetWorkspaces: missingTargetWorkspacesSelector(state),
  sourceWorkspaces: sourceWorkspacesSelector(state),
  targetToolDisplayName: targetToolDisplayNameSelector(state),
  targetWorkspaces: targetWorkspacesSelector(state),
  toolAction: toolActionSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissAllNotifications: dismissAllNotifications,
  onFetchAllEntities: fetchAllEntities.request,
  onFetchWorkspaces: fetchWorkspaces.request,
  onFlipIsWorkspaceIncluded: flipIsWorkspaceIncluded,
  onPush: push,
  onShowNotification: showNotification,
  onUpdateActiveWorkspaceId: updateActiveWorkspaceId,
  onUpdateFetchAllFetchStatus: updateFetchAllFetchStatus,
  onUpdateWorkspaceLinking: updateWorkspaceLinking,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSourceWorkspacesStepComponent);

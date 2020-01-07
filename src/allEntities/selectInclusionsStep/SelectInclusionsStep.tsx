import { push } from "connected-react-router";
import { Path } from "history";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  fetchAllEntities,
  flipIfExistsInTargetShown,
  updateFetchAllFetchStatus,
} from "~/allEntities/allEntitiesActions";
import {
  areExistsInTargetShownSelector,
  entityGroupInProcessDisplaySelector,
  fetchAllFetchStatusSelector,
  totalIncludedRecordsCountSelector,
} from "~/allEntities/allEntitiesSelectors";
import { FetchStatus } from "~/allEntities/allEntitiesTypes";
import { RoutePath } from "~/app/appTypes";
import ClientsInclusionsPanel from "~/clients/clientsInclusionsPanel/ClientsInclusionsPanel";
import {
  Accordion,
  Button,
  HelpDetails,
  Loader,
  LoadingMessage,
  NavigationButtonsRow,
  Note,
} from "~/components";
import ProjectsInclusionsPanel from "~/projects/projectsInclusionsPanel/ProjectsInclusionsPanel";
import { ReduxState } from "~/redux/reduxTypes";
import TagsInclusionsPanel from "~/tags/tagsInclusionsPanel/TagsInclusionsPanel";
import TasksInclusionsPanel from "~/tasks/tasksInclusionsPanel/TasksInclusionsPanel";
import TimeEntriesInclusionsPanel from "~/timeEntries/timeEntriesInclusionsPanel/TimeEntriesInclusionsPanel";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import ActiveWorkspaceSelect from "./ActiveWorkspaceSelect";
import NoSelectionsModal from "./NoSelectionsModal";
import ShowExistingToggle from "./ShowExistingToggle";

interface ConnectStateProps {
  activeWorkspaceId: string;
  areExistsInTargetShown: boolean;
  entityGroupInProcessDisplay: string;
  fetchAllFetchStatus: FetchStatus;
  totalIncludedRecordsCount: number;
}

interface ConnectDispatchProps {
  onFetchAllEntities: PayloadActionCreator<string, void>;
  onFlipIfExistsInTargetShown: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
  onUpdateFetchAllFetchStatus: PayloadActionCreator<string, FetchStatus>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectInclusionsStepComponent: React.FC<Props> = props => {
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState<boolean>(
    false,
  );

  React.useEffect(() => {
    props.onFetchAllEntities();

    if (!props.areExistsInTargetShown) {
      props.onFlipIfExistsInTargetShown();
    }

    return () => {
      props.onUpdateFetchAllFetchStatus(FetchStatus.Pending);
    };
  }, []);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectWorkspaces);
  };

  const handleNextClick = (): void => {
    if (props.totalIncludedRecordsCount === 0) {
      setIsErrorModalOpen(true);
      return;
    }

    props.onPush(RoutePath.PerformToolAction);
  };

  const buttonsDisabled = props.fetchAllFetchStatus === FetchStatus.InProcess;

  return (
    <section>
      <h1>Step 4: Select Data to Transfer</h1>
      <HelpDetails>
        <p>
          Review the records you&apos;d like to include in the transfer. If the
          record already exists on the target tool, the option to include it is
          disabled.
        </p>
        <p>
          Change the active workspace by selecting it from the
          <strong> Active Workspace</strong> dropdown. Toggling
          <strong> Show records that already exist in target? </strong>
          will either show or hide the records that already exist in the target
          tool. This is useful if you only wish to see the records that
          <i> can</i> be transferred to the target tool.
        </p>
        <p>
          Pressing the <strong>Include All/None</strong> button in the header
          above each table will select or deselect all of the corresponding
          records to be included in the transfer. If all of the records in the
          group already exist, the button will be disabled. The footer in each
          table contains the totals associated with the corresponding column.
        </p>
        <p>
          Press the <strong>Next</strong> button when you&apos;re ready to begin
          the transfer.
          <Note as="span" css={{ marginLeft: "0.375rem" }}>
            The transfer will not start until you confirm it on the next page.
          </Note>
        </p>
      </HelpDetails>
      {props.fetchAllFetchStatus === FetchStatus.Success ? (
        <>
          <ActiveWorkspaceSelect />
          <ShowExistingToggle
            isToggled={props.areExistsInTargetShown}
            onToggle={() => props.onFlipIfExistsInTargetShown()}
          />
          <h2>Workspace Records</h2>
          <Accordion css={{ marginBottom: "2rem" }}>
            <ClientsInclusionsPanel />
            <TagsInclusionsPanel />
            <ProjectsInclusionsPanel />
            <TasksInclusionsPanel />
            <TimeEntriesInclusionsPanel />
          </Accordion>
        </>
      ) : (
        <>
          <Loader />
          <LoadingMessage>
            Fetching {props.entityGroupInProcessDisplay}, please wait...
          </LoadingMessage>
        </>
      )}
      <NavigationButtonsRow
        disabled={buttonsDisabled}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      >
        <Button
          variant="outlinePrimary"
          disabled={buttonsDisabled}
          onClick={() => props.onFetchAllEntities()}
        >
          Refresh
        </Button>
      </NavigationButtonsRow>
      <NoSelectionsModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  areExistsInTargetShown: areExistsInTargetShownSelector(state),
  entityGroupInProcessDisplay: entityGroupInProcessDisplaySelector(state),
  fetchAllFetchStatus: fetchAllFetchStatusSelector(state),
  totalIncludedRecordsCount: totalIncludedRecordsCountSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchAllEntities: fetchAllEntities.request,
  onFlipIfExistsInTargetShown: flipIfExistsInTargetShown,
  onPush: push,
  onUpdateFetchAllFetchStatus: updateFetchAllFetchStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectInclusionsStepComponent);

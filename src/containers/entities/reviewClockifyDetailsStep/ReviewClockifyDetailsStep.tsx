import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { If, Then, Else, When } from 'react-if';
import { css } from 'emotion';
import {
  fetchClockifyEntitiesInWorkspace,
  fetchClockifyWorkspaces,
  transferEntitiesToClockifyWorkspace,
} from '~/redux/entities/workspaces/workspacesActions';
import {
  selectClockifyIncludedWorkspacesById,
  selectTogglCountsByGroupByWorkspace,
  selectTogglEntitiesByGroupByWorkspace,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from '~/redux/entities/workspaces/workspacesSelectors';
import EntitiesReviewPage from '~/components/entitiesReviewPage/EntitiesReviewPage';
import Loader from '~/components/loader/Loader';
import { StepPageProps } from '~/components/stepPage/StepPage';
import ConfirmationModal from './components/ConfirmationModal';
import {
  CompoundWorkspaceModel,
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
  ReduxDispatch,
  ReduxState,
  ToolName,
} from '~/types';

interface ConnectStateProps {
  clockifyWorkspacesById: Record<string, CompoundWorkspaceModel>;
  togglCountsByGroupByWorkspace: CountsByGroupByWorkspaceModel;
  togglEntitiesByGroupByWorkspace: EntitiesByGroupByWorkspaceModel;
  togglWorkspacesById: Record<string, CompoundWorkspaceModel>;
  workspaceNameBeingFetched: string;
}

interface ConnectDispatchProps {
  onFetchClockifyEntitiesInWorkspace: (
    workspace: CompoundWorkspaceModel,
  ) => Promise<any>;
  onFetchClockifyWorkspaces: () => Promise<any>;
  onTransferEntitiesToClockifyWorkspace: (
    workspace: CompoundWorkspaceModel,
  ) => Promise<any>;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const ReviewClockifyDetailsStepComponent: React.FC<Props> = props => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isModalActive, setIsModalActive] = useState<boolean>(false);

  const fetchClockifyEntitiesInAllWorkspaces = async () => {
    const workspaces = Object.values(props.clockifyWorkspacesById);
    if (workspaces.length === 0) return Promise.resolve();

    for (const workspace of workspaces) {
      await props.onFetchClockifyEntitiesInWorkspace(workspace);
    }
  };

  useEffect(() => {
    props
      .onFetchClockifyWorkspaces()
      .then(fetchClockifyEntitiesInAllWorkspaces)
      .then(() => setIsFetching(false))
      .catch(() => setIsFetching(false));
  }, []);

  const handleNextClick = (): void => {
    setIsModalActive(true);
  };

  const transferAllEntitiesToClockify = async () => {
    setIsTransferring(true);
    const workspaces = Object.values(props.togglWorkspacesById);
    for (const workspace of workspaces) {
      await props.onTransferEntitiesToClockifyWorkspace(workspace);
    }
    setIsTransferring(false);
  };

  const handleModalConfirmClick = () => {
    setIsModalActive(false);
    transferAllEntitiesToClockify()
      .then(() => props.onNextClick())
      .catch(() => props.onNextClick());
  };

  const fetchedName = props.workspaceNameBeingFetched;

  return (
    <If condition={isFetching || isTransferring}>
      <Then>
        <Loader>
          <When condition={isFetching}>
            Fetching Clockify entities, please wait...
          </When>
          <When condition={isTransferring}>
            Transferring entities to Clockify for {fetchedName}, please wait...
          </When>
        </Loader>
      </Then>
      <Else>
        <EntitiesReviewPage
          stepNumber={props.stepNumber}
          subtitle="Review Pending Data Before Transfer"
          toolName={ToolName.Clockify}
          entitiesByGroupByWorkspace={props.togglEntitiesByGroupByWorkspace}
          countsByGroupByWorkspace={props.togglCountsByGroupByWorkspace}
          workspacesById={props.togglWorkspacesById}
          onPreviousClick={props.onPreviousClick}
          onNextClick={handleNextClick}
          instructions={
            <>
              <p
                className={css`
                  margin-bottom: 1rem;
                `}
              >
                This page contains all the records that <strong>will</strong> be
                created on Clockify once you press the <strong>Next </strong>
                button and confirm. Any records that already exist on Clockify
                have a blue tag next to the name. These will not be transferred.
                I couldn&apos;t even do it if I tried, you&apos;ll just end up
                in API Error City, trust me.
              </p>
              <p
                className={css`
                  margin-bottom: 1rem;
                `}
              >
                Unfortunately, Clockify won&apos;t prevent you from creating
                duplicate time entries. Ensuring that a time entry doesn&apos;t
                get duplicated is considerably more complex. You have to compare
                several fields from each Toggl time entry to the corresponding
                field on the Clockify time entry and yadda yadda yadda.
              </p>
              <p
                className={css`
                  margin-bottom: 1rem;
                `}
              >
                <strong>Eventually</strong>, I&apos;m going to add a check to
                ensure that you don&apos;t end up creating duplicate time
                entries. I tried to have it ready for the first release but it
                just wasn&apos;t in the cards.
              </p>
              <p
                className={css`
                  color: var(--info);
                  font-weight: bold;
                  margin-bottom: 1rem;
                `}
              >
                Just keep in mind that using this tool **multiple times** will
                most likely result in duplicate time entries (unless you picked
                different projects each time).
              </p>
              <p>
                Anywho, now that we got that out of the way, just one more
                thing: If you see something here that you
                <strong> don&apos;t</strong> want transferred, you have to press
                the <strong>Previous</strong> button to go back and uncheck it.
                I know, it&apos;s kind of a pain in the butt, but it beats
                copying and pasting all your time entries into Clockify from
                like a spreadsheet or something.
              </p>
            </>
          }
        />
        <ConfirmationModal
          isActive={isModalActive}
          onConfirmClick={handleModalConfirmClick}
          onCancelClick={() => setIsModalActive(false)}
        />
      </Else>
    </If>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  clockifyWorkspacesById: selectClockifyIncludedWorkspacesById(state),
  togglEntitiesByGroupByWorkspace: selectTogglEntitiesByGroupByWorkspace(state),
  togglCountsByGroupByWorkspace: selectTogglCountsByGroupByWorkspace(state),
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchClockifyEntitiesInWorkspace: (workspace: CompoundWorkspaceModel) =>
    dispatch(fetchClockifyEntitiesInWorkspace(workspace)),
  onFetchClockifyWorkspaces: () => dispatch(fetchClockifyWorkspaces()),
  onTransferEntitiesToClockifyWorkspace: (workspace: CompoundWorkspaceModel) =>
    dispatch(transferEntitiesToClockifyWorkspace(workspace)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewClockifyDetailsStepComponent);

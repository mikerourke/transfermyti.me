import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { If, Then, Else } from 'react-if';
import { css } from 'emotion';
import { isNil } from 'lodash';
import {
  fetchTogglEntitiesInWorkspace,
  flipIsWorkspaceEntityIncluded,
} from '~/redux/entities/workspaces/workspacesActions';
import {
  selectTogglAllEntitiesByWorkspaceId,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from '~/redux/entities/workspaces/workspacesSelectors';
import EntitiesReviewPage from '~/components/entitiesReviewPage/EntitiesReviewPage';
import Loader from '~/components/loader/Loader';
import { StepPageProps } from '~/components/stepPage/StepPage';
import InstructionsList from './components/InstructionsList';
import {
  EntityModel,
  ReduxDispatch,
  ReduxState,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

interface ConnectStateProps {
  entitiesByWorkspaceId: Record<string, Record<EntityGroup, EntityModel[]>>;
  workspaceNameBeingFetched: string;
  workspacesById: Record<string, WorkspaceModel>;
}

interface ConnectDispatchProps {
  onFetchEntitiesForWorkspace: (
    workspaceRecord: WorkspaceModel,
  ) => Promise<any>;
  onFlipIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const SelectTogglInclusionsStepComponent: React.FC<Props> = ({
  workspaceNameBeingFetched,
  workspacesById,
  onFetchEntitiesForWorkspace,
  ...reviewPageProps
}) => {
  const fetchEntitiesForAllWorkspaces = async () => {
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
          {...reviewPageProps}
        >
          <p
            className={css`
              margin-bottom: 1rem;
            `}
          >
            Select which entities/records you want to transfer and press the
            <strong> Next</strong> button when you're ready. There are a few
            things to be aware of:
          </p>
          <div
            className={css`
              margin-bottom: 1rem;
            `}
          >
            <InstructionsList />
          </div>
        </EntitiesReviewPage>
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

const mapStateToProps = (state: ReduxState) => ({
  entitiesByWorkspaceId: selectTogglAllEntitiesByWorkspaceId(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
  workspacesById: selectTogglIncludedWorkspacesById(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchEntitiesForWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchTogglEntitiesInWorkspace(workspaceRecord)),
  onFlipIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => dispatch(flipIsWorkspaceEntityIncluded(entityGroup, entityRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglInclusionsStepComponent);

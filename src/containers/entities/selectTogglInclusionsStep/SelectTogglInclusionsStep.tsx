import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { isNil } from 'lodash';
import {
  fetchTogglEntitiesInWorkspace,
  updateIsWorkspaceEntityIncluded,
} from '~/redux/entities/workspaces/workspacesActions';
import {
  selectTogglEntitiesByWorkspaceId,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from '~/redux/entities/workspaces/workspacesSelectors';
import EntitiesReviewPage from '~/components/entitiesReviewPage/EntitiesReviewPage';
import Loader from '~/components/loader/Loader';
import InstructionsList from './components/InstructionsList';
import { EntityModel, ReduxDispatch, ReduxState } from '~/types/commonTypes';
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
  onUpdateIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => void;
}

interface OwnProps {
  stepNumber: number;
  previous: () => void;
  next: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

export class SelectTogglInclusionsStepComponent extends React.Component<Props> {
  public componentDidMount(): void {
    this.fetchEntitiesForAllWorkspaces();
  }

  private fetchEntitiesForAllWorkspaces = async () => {
    const workspaceRecords = Object.values(this.props.workspacesById);
    for (const workspaceRecord of workspaceRecords) {
      await this.props.onFetchEntitiesForWorkspace(workspaceRecord);
    }
  };

  public render() {
    const {
      onFetchEntitiesForWorkspace,
      workspaceNameBeingFetched,
      ...reviewPageProps
    } = this.props;
    if (!isNil(workspaceNameBeingFetched)) {
      return (
        <Loader>
          Fetching entities in <strong>{workspaceNameBeingFetched} </strong>
          workspace...
        </Loader>
      );
    }

    return (
      <EntitiesReviewPage
        subtitle="Select Toggl Records to Transfer"
        onRefreshClick={this.fetchEntitiesForAllWorkspaces}
        {...reviewPageProps}
      >
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Select which entities/records you want to transfer and press the
          <strong> Next</strong> button when you're ready. There are a few
          things to be aware of:
        </p>
        <div
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          <InstructionsList />
        </div>
      </EntitiesReviewPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  entitiesByWorkspaceId: selectTogglEntitiesByWorkspaceId(state),
  workspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchEntitiesForWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchTogglEntitiesInWorkspace(workspaceRecord)),
  onUpdateIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => dispatch(updateIsWorkspaceEntityIncluded(entityGroup, entityRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglInclusionsStepComponent);

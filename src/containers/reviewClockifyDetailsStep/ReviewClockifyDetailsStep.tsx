import React from "react";
import { connect } from "react-redux";
import { If, Then, Else } from "react-if";
import styled from "@emotion/styled";
import {
  fetchClockifyEntitiesInWorkspace,
  fetchClockifyWorkspaces,
} from "~/workspaces/workspacesActions";
import {
  selectClockifyIncludedWorkspacesById,
  selectTogglCountsByGroupByWorkspace,
  selectTogglEntitiesByGroupByWorkspace,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from "~/workspaces/workspacesSelectors";
import { EntitiesReviewPage, Loader, StepPageProps } from "~/components";
import InstructionsList from "./InstructionsList";
import { ToolName } from "~/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  CompoundWorkspaceModel,
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
} from "~/workspaces/workspacesTypes";

const TransferNote = styled.p({
  color: "var(-info)",
  fontWeight: "bold",
  marginBottom: "1rem",
});

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
  ) => void;
  onFetchClockifyWorkspaces: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

interface State {
  isFetching: boolean;
}

export class ReviewClockifyDetailsStepComponent extends React.Component<
  Props,
  State
> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      isFetching: true,
    };
  }

  public componentDidMount(): void {
    this.performFetchActions()
      .then(() => this.setState({ isFetching: false }))
      .catch(() => this.setState({ isFetching: false }));
  }

  private performFetchActions = async (): Promise<void> => {
    await this.props.onFetchClockifyWorkspaces();
    await this.fetchClockifyEntitiesInAllWorkspaces();
  };

  private fetchClockifyEntitiesInAllWorkspaces = async (): Promise<void> => {
    const workspaces = Object.values(this.props.clockifyWorkspacesById);
    if (workspaces.length === 0) {
      return;
    }

    for (const workspace of workspaces) {
      await this.props.onFetchClockifyEntitiesInWorkspace(workspace);
    }
  };

  public render(): JSX.Element {
    const {
      togglEntitiesByGroupByWorkspace,
      togglCountsByGroupByWorkspace,
      togglWorkspacesById,
    } = this.props;

    return (
      <If condition={this.state.isFetching}>
        <Then>
          <Loader>Fetching Clockify entities, please wait...</Loader>
        </Then>
        <Else>
          <EntitiesReviewPage
            stepNumber={this.props.stepNumber}
            subtitle="Review Pending Data Before Transfer"
            toolName={ToolName.Clockify}
            entitiesByGroupByWorkspace={togglEntitiesByGroupByWorkspace}
            countsByGroupByWorkspace={togglCountsByGroupByWorkspace}
            workspacesById={togglWorkspacesById}
            onPreviousClick={this.props.onPreviousClick}
            onNextClick={this.props.onNextClick}
            onRefreshClick={this.fetchClockifyEntitiesInAllWorkspaces}
            instructions={
              <>
                <p css={{ marginBottom: "1rem" }}>
                  This page contains all the records that <strong>will</strong>{" "}
                  be created on Clockify. Press <strong>Next</strong> to move to
                  the final step.
                </p>
                <TransferNote>
                  The transfer will not start until you confirm it on the next
                  page.
                </TransferNote>
                <InstructionsList />
              </>
            }
          />
        </Else>
      </If>
    );
  }
}

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  clockifyWorkspacesById: selectClockifyIncludedWorkspacesById(state),
  togglEntitiesByGroupByWorkspace: selectTogglEntitiesByGroupByWorkspace(state),
  togglCountsByGroupByWorkspace: selectTogglCountsByGroupByWorkspace(state),
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchClockifyEntitiesInWorkspace: fetchClockifyEntitiesInWorkspace,
  onFetchClockifyWorkspaces: fetchClockifyWorkspaces,
};

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewClockifyDetailsStepComponent);

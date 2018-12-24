import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { Checkbox, Control, Field, Table } from 'bloomer';
import { updateIsWorkspaceSelected } from '../../../redux/entities/workspaces/workspacesActions';
import { selectTogglWorkspaceRecords } from '../../../redux/entities/workspaces/workspacesSelectors';
import StepPage from '../../../components/stepPage/StepPage';
import { ReduxDispatch, ReduxState } from '../../../types/common';
import { WorkspaceModel } from '../../../types/workspaces';

interface ConnectStateProps {
  workspaceRecords: WorkspaceModel[];
}

interface ConnectDispatchProps {
  onUpdateIsWorkspaceSelected: (workspaceId: string) => void;
}

interface OwnProps {
  next: () => void;
  previous: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

const WorkspacesStepComponent: React.FunctionComponent<Props> = props => (
  <StepPage
    title="Step 2:"
    subtitle="Select Toggl Workspaces to Transfer"
    onNextClick={props.next}
    onPreviousClick={props.previous}
  >
    <p
      className={css`
        margin-bottom: 1.25rem;
      `}
    >
      Select which workspaces you want to transfer to Clockify.
    </p>
    <Table isBordered>
      <thead>
        <tr>
          <th />
          <th>Workspace Name</th>
        </tr>
      </thead>
      <tbody>
        {props.workspaceRecords.map(({ id, name, isSelected }) => (
          <tr key={id}>
            <td>
              <Field>
                <Control hasTextAlign="centered">
                  <Checkbox
                    onChange={() => props.onUpdateIsWorkspaceSelected(id)}
                    checked={isSelected}
                  />
                </Control>
              </Field>
            </td>
            <td>{name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </StepPage>
);

const mapStateToProps = (state: ReduxState) => ({
  workspaceRecords: selectTogglWorkspaceRecords(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onUpdateIsWorkspaceSelected: (workspaceId: string) =>
    dispatch(updateIsWorkspaceSelected(workspaceId)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(WorkspacesStepComponent);

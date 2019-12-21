import React from "react";
import { connect } from "react-redux";
import { Steps } from "rsuite";
import { selectCurrentTransferStep } from "~/app/appSelectors";
import { ReduxState } from "~/redux/reduxTypes";

export interface ConnectStateProps {
  currentTransferStep: number;
}

export const StepSelectorComponent: React.FC<ConnectStateProps> = props => (
  <Steps current={props.currentTransferStep} css={{ padding: "2rem" }}>
    <Steps.Item title="Select Type" />
    <Steps.Item title="Enter Credentials" />
    <Steps.Item title="Pick Workspaces" />
    <Steps.Item title="Review Source" />
    <Steps.Item title="Select for Target" />
    <Steps.Item title="Perform Transfer" />
  </Steps>
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  currentTransferStep: selectCurrentTransferStep(state),
});

export default connect(mapStateToProps)(StepSelectorComponent);

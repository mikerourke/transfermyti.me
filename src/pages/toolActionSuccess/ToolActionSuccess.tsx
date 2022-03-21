import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";

import { Icon, styled } from "~/components";
import {
  targetToolDisplayNameSelector,
  targetToolTrackerUrlSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { flushCredentials } from "~/modules/credentials/credentialsActions";
import { ReduxState } from "~/typeDefs";

import BuyMeACoffeeButton from "./BuyMeACoffeeButton";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    font-size: 3rem;
    margin: 2rem 0;
  }

  iframe {
    height: 315px;
    box-shadow: var(--elevation-dp8);
  }

  div {
    display: flex;
    margin-top: 3rem;
  }

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 3.25rem;
    min-width: 16rem;
    margin: 0 1rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-size: 1.25rem;
    background-color: var(--color-primary);
    color: var(--color-white);
    box-shadow: var(--elevation-dp2);
  }
`;

interface ConnectStateProps {
  targetToolDisplayName: string;
  targetToolTrackerUrl: string;
}

interface ConnectDispatchProps {
  onFlushCredentials: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ToolActionSuccessComponent: React.FC<Props> = (props) => {
  React.useEffect(() => {
    props.onFlushCredentials();
  }, []);

  const buttonColor =
    props.targetToolDisplayName.toLowerCase() === "toggl"
      ? "var(--color-toggl-red)"
      : "var(--color-clockify-blue)";

  return (
    <StyledDiv>
      {/* prettier-ignore */}
      <h1>
        <span role="img" aria-label="Celebrate">🎉</span> All Done! <span role="img" aria-label="Celebrate">🎉</span>
      </h1>

      <iframe
        title="Thank you for being a friend"
        width={480}
        height={315}
        src="https://www.youtube.com/embed/dTmgL0XQehI"
        frameBorder={0}
        allow={["accelerometer", "encrypted-media"].join("; ")}
        allowFullScreen
      />

      <div>
        <a
          href={props.targetToolTrackerUrl}
          rel="noopener noreferrer"
          target="_blank"
          style={{ backgroundColor: buttonColor }}
        >
          <span>Go To {props.targetToolDisplayName}</span>

          <Icon
            name="openExternal"
            color="var(--color-white)"
            size={16}
            style={{ margin: "0 0.5rem" }}
          />
        </a>

        <BuyMeACoffeeButton />
      </div>
    </StyledDiv>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  targetToolDisplayName: targetToolDisplayNameSelector(state),
  targetToolTrackerUrl: targetToolTrackerUrlSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlushCredentials: flushCredentials,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolActionSuccessComponent);

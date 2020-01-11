import Color from "color";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  targetToolTrackerUrlSelector,
  targetToolDisplayNameSelector,
} from "~/allEntities/allEntitiesSelectors";
import { flushCredentials } from "~/credentials/credentialsActions";
import { Flex, styled, getOpenInNewTabContent } from "~/components";
import BuyMeACoffeeButton from "./BuyMeACoffeeButton";
import { ReduxState } from "~/typeDefs";

// TODO: Add link to view records on the transfer tool (if tool action was
//       for transfer). Also, maybe a link to buy me a coffee or something?

const Celebrate: React.FC = () => (
  <span role="img" aria-label="Celebrate">
    🎉
  </span>
);

const VideoIframe = styled.iframe(
  {
    height: 315,
  },
  ({ theme }) => ({
    boxShadow: theme.elevation.dp8,
  }),
);

const ViewDataLinkButton = styled.a(
  {
    alignItems: "center",
    border: "1px solid transparent",
    borderRadius: "0.375rem",
    display: "inline-flex",
    fontSize: "1.25rem",
    height: "3.25rem",
    justifyContent: "center",
    marginRight: "2rem",
    minWidth: "15rem",
  },
  ({ theme }) => ({
    background: theme.colors.primary,
    color: theme.colors.white,

    "&:hover": {
      background: Color(theme.colors.primary)
        .darken(0.1)
        .hex(),
    },

    "&:after": {
      content: getOpenInNewTabContent(theme.colors.white),
      margin: "0.25rem",
    },
  }),
);

interface ConnectStateProps {
  targetToolDisplayName: string;
  targetToolTrackerUrl: string;
}

interface ConnectDispatchProps {
  onFlushCredentials: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const ToolActionSuccessComponent: React.FC<Props> = props => {
  React.useEffect(() => {
    props.onFlushCredentials();
  }, []);

  return (
    <Flex alignItems="center" justifyContent="center" direction="column">
      <h1 css={{ fontSize: "3rem", margin: "2rem 0" }}>
        <Celebrate /> Transfer Complete! <Celebrate />
      </h1>
      <VideoIframe
        title="Thank you for being a friend"
        width={480}
        height={315}
        src="https://www.youtube.com/embed/dTmgL0XQehI"
        frameBorder={0}
        allow={["accelerometer", "encrypted-media"].join("; ")}
        allowFullScreen
      />
      <Flex css={{ marginTop: "3rem" }}>
        <ViewDataLinkButton href={props.targetToolTrackerUrl}>
          <span>Go To {props.targetToolDisplayName}</span>
        </ViewDataLinkButton>
        <BuyMeACoffeeButton />
      </Flex>
    </Flex>
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

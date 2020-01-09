import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flushCredentials } from "~/credentials/credentialsActions";
import { Flex } from "~/components";

// TODO: Add link to view records on the transfer tool (if tool action was
//       for transfer). Also, maybe a link to buy me a coffee or something?

const Celebrate: React.FC = () => (
  <span role="img" aria-label="Celebrate">
    🎉
  </span>
);

interface ConnectDispatchProps {
  onFlushCredentials: PayloadActionCreator<string, void>;
}

type Props = ConnectDispatchProps;

export const ToolActionSuccessComponent: React.FC<Props> = props => {
  React.useEffect(() => {
    props.onFlushCredentials();
  }, []);

  return (
    <Flex alignItems="center" justifyContent="center" direction="column">
      <h1 css={{ fontSize: "3rem", margin: "2rem 0" }}>
        <Celebrate /> Transfer Complete! <Celebrate />
      </h1>
      <iframe
        title="Thank you for being a friend"
        css={{
          boxShadow: "0.75rem 0.5rem 0.5rem grey",
          height: 315,
        }}
        width={480}
        height={315}
        src="https://www.youtube.com/embed/dTmgL0XQehI"
        frameBorder={0}
        allow={["accelerometer", "autoplay", "encrypted-media"].join("; ")}
        allowFullScreen
      />
    </Flex>
  );
};

const mapDispatchToProps: ConnectDispatchProps = {
  onFlushCredentials: flushCredentials,
};

export default connect(null, mapDispatchToProps)(ToolActionSuccessComponent);

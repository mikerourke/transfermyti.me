import React from "react";
import { Flex } from "~/components";

const Celebrate: React.FC = () => (
  <span role="img" aria-label="Celebrate">
    🎉
  </span>
);

const TransferSuccess: React.FC = () => (
  <Flex alignItems="center" justifyContent="center" direction="column">
    <h1 css={{ fontSize: "3rem", margin: "2rem 0" }}>
      <Celebrate /> Transfer Complete! <Celebrate />
    </h1>
    <iframe
      title="Thank you for being a friend"
      css={{ boxShadow: "0.75rem 0.5rem 0.5rem grey", height: 315 }}
      width={480}
      height={315}
      src="https://www.youtube.com/embed/dTmgL0XQehI"
      frameBorder={0}
      allow={["accelerometer", "autoplay", "encrypted-media"].join("; ")}
      allowFullScreen
    />
  </Flex>
);

export default TransferSuccess;

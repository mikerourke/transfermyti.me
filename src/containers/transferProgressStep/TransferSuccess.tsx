import React from "react";
import { css } from "emotion";
import { Title } from "bloomer";

const TransferSuccess: React.FC = () => (
  <div className={css({ minHeight: 360, textAlign: "center" })}>
    <Title isSize={3}>🎉 🎉 🎉 Transfer Complete! 🎉 🎉 🎉</Title>
    <iframe
      className={css({ boxShadow: "0.75rem 0.5rem 0.5rem grey", height: 315 })}
      width={480}
      height={315}
      // src="https://www.youtube.com/embed/dTmgL0XQehI?autoplay=1"
      src="https://www.youtube.com/embed/dTmgL0XQehI"
      frameBorder={0}
      allow={["accelerometer", "autoplay", "encrypted-media"].join("; ")}
      allowFullScreen
    />
  </div>
);

export default TransferSuccess;

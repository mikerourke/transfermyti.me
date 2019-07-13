import React from "react";
import { css } from "emotion";
import { Title } from "bloomer";

const TransferSuccess: React.FC = () => (
  <div
    className={css`
      min-height: 360px;
      text-align: center;
    `}
  >
    <Title isSize={3}>🎉 🎉 🎉 Transfer Complete! 🎉 🎉 🎉</Title>
    <iframe
      className={css`
        box-shadow: 0.75rem 0.5rem 0.5rem grey;
        height: 315px;
      `}
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

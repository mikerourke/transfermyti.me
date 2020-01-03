import React from "react";

interface Props {
  size?: "small" | "large";
}

const LoadingMessage: React.FC<Props> = ({ size = "small", ...props }) => (
  <div
    css={theme => ({
      fontWeight: theme.fontWeights.bold,
      fontSize: size === "large" ? "2rem" : "1rem",
      margin: "1rem 0 3rem 0",
      textAlign: "center",
    })}
    {...props}
  />
);

export default LoadingMessage;

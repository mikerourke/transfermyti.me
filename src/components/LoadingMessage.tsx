import React from "react";

const LoadingMessage: React.FC = (props) => (
  <div
    css={(theme) => ({
      fontWeight: theme.fontWeights.bold,
      fontSize: "1rem",
      margin: "1rem 0 3rem 0",
      textAlign: "center",
    })}
    {...props}
  />
);

export default LoadingMessage;

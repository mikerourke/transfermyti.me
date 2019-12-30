import React from "react";

interface Props {
  size?: "small" | "large";
}

const LoadingMessage: React.FC<Props> = ({ size = "small", ...props }) => (
  <div
    css={{
      fontWeight: "bold",
      fontSize: size === "large" ? 32 : 16,
      margin: "1rem 0 3rem 0",
      textAlign: "center",
    }}
    {...props}
  />
);

export default LoadingMessage;

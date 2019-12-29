import React from "react";

interface Props {
  size?: "small" | "large";
}

const LoadingMessage: React.FC<Props> = ({ size = "small", ...props }) => (
  <div
    css={{
      textAlign: "center",
      fontWeight: "bold",
      fontSize: size === "large" ? 32 : 16,
    }}
    {...props}
  />
);

export default LoadingMessage;

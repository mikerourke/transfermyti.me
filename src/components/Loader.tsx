import { keyframes } from "@emotion/core";
import * as R from "ramda";
import React from "react";
import { styled } from "./emotion";
import Flex from "./Flex";
import LoadingMessage from "./LoadingMessage";

const cubeFoldingAnimation = keyframes({
  "0%, 10%": {
    transform: "perspective(140px) rotateX(-180deg)",
    opacity: 0,
  },

  "25%, 75%": {
    transform: "perspective(140px) rotateX(0deg)",
    opacity: 1,
  },

  "90%, 100%": {
    transform: "perspective(140px) rotateY(180deg)",
    opacity: 0,
  },
});

const CubesContainer = styled.div({
  transform: "rotateZ(45deg)",
  margin: "2rem auto",
  width: "4rem",
  height: "6rem",
});

const Cube = styled.div<{ rotation: number; delay: number }>(
  {
    float: "left",
    width: "50%",
    height: "50%",
    position: "relative",
    transform: "scale(1.1)",

    "&:before": {
      content: `""`,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      animation: `${cubeFoldingAnimation} 2.4s infinite linear both`,
      transformOrigin: "100% 100%",
    },
  },
  ({ rotation, delay, theme }) => ({
    transform: `scale(1.1) rotateZ(${rotation}deg)`,

    "&:before": {
      backgroundColor: theme.colors.primary,
      animationDelay: `${delay}s`,
    },
  }),
);

const Loader: React.FC = ({ children, ...props }) => (
  <Flex
    alignItems="center"
    justifyContent="center"
    direction="column"
    {...props}
  >
    <CubesContainer>
      <Cube rotation={0} delay={0} />
      <Cube rotation={90} delay={0.3} />
      <Cube rotation={270} delay={0.9} />
      <Cube rotation={180} delay={0.6} />
    </CubesContainer>
    {!R.isNil(children) && (
      <LoadingMessage>{children}</LoadingMessage>
    )}
  </Flex>
);

export default Loader;

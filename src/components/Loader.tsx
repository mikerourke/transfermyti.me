import React from "react";
import { Unless } from "react-if";
import * as R from "ramda";
import { keyframes } from "@emotion/core";
import styled from "@emotion/styled";
import Flex from "~/components/Flex";

const cubeFoldingAnimation = keyframes`
    0%, 10% {
      transform: perspective(140px) rotateX(-180deg);
      opacity: 0; 
    } 25%, 75% {
      transform: perspective(140px) rotateX(0deg);
      opacity: 1; 
    } 90%, 100% {
      transform: perspective(140px) rotateY(180deg);
      opacity: 0; 
    }
  `;

const CubesContainer = styled.div<{ size: "small" | "large" }>(
  {
    transform: "rotateZ(45deg)",
  },
  ({ size }) => ({
    margin: size === "large" ? "3rem auto" : "2rem auto",
    width: size === "large" ? "6rem" : "4rem",
    height: size === "large" ? "6rem" : "4rem",
  }),
);

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
      backgroundColor: "gray",
      transformOrigin: "100% 100%",
    },
  },
  ({ rotation, delay }) => ({
    transform: `scale(1.1) rotateZ(${rotation}deg)`,

    "&:before": {
      animationDelay: `${delay}s`,
    },
  }),
);

const LoadingMessage = styled.div<{ size: "small" | "large" }>(
  {
    textAlign: "center",
    fontWeight: "bold",
  },
  ({ size }) => ({
    fontSize: size === "large" ? 32 : 16,
  }),
);

interface Props {
  size?: "small" | "large";
}

const Loader: React.FC<Props> = ({ size = "small", children, ...props }) => (
  <Flex
    alignItems="center"
    justifyContent="center"
    direction="column"
    {...props}
  >
    <CubesContainer size={size}>
      <Cube rotation={0} delay={0} />
      <Cube rotation={90} delay={0.3} />
      <Cube rotation={270} delay={0.9} />
      <Cube rotation={180} delay={0.6} />
    </CubesContainer>
    <Unless condition={R.isNil(children)}>
      <LoadingMessage data-testid="loader-message" size={size}>
        {children}
      </LoadingMessage>
    </Unless>
  </Flex>
);

export default Loader;

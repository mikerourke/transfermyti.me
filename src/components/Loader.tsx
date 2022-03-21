import * as R from "ramda";
import React from "react";

import { styled } from "./emotion";
import LoadingMessage from "./LoadingMessage";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > div {
    width: 6rem;
    height: 6rem;
    margin: 2rem auto;
    transform: rotateZ(45deg);
  }

  span {
    display: block;
    position: relative;
    height: 50%;
    width: 50%;
    float: left;
  }

  span::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: 100% 100%;
    content: "";
    animation: cube-folding 2.4s infinite linear both;
    background-color: var(--color-primary);
  }

  > div span:first-of-type {
    transform: scale(1.1) rotateZ(0deg);
  }

  > div span:first-of-type::before {
    animation-delay: 0ms;
  }

  > div span:nth-of-type(2) {
    transform: scale(1.1) rotateZ(90deg);
  }

  > div span:nth-of-type(2)::before {
    animation-delay: 300ms;
  }

  > div span:nth-of-type(3) {
    transform: scale(1.1) rotateZ(270deg);
  }

  > div span:nth-of-type(3)::before {
    animation-delay: 900ms;
  }

  > div span:last-of-type {
    transform: scale(1.1) rotateZ(180deg);
  }

  > div span:last-of-type::before {
    animation-delay: 600ms;
  }
`;

const Loader: React.FC = ({ children, ...props }) => (
  <StyledDiv {...props}>
    <div role="status">
      <span />
      <span />
      <span />
      <span />
    </div>

    {!R.isNil(children) && <LoadingMessage>{children}</LoadingMessage>}
  </StyledDiv>
);

export default Loader;

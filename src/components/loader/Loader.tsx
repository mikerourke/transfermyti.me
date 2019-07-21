import React from "react";
import classnames from "classnames";
import { css, keyframes } from "emotion";

const Loader: React.FC = ({ children }) => {
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

  const cubeClass = css`
    float: left;
    width: 50%;
    height: 50%;
    position: relative;
    transform: scale(1.1);

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      animation: ${cubeFoldingAnimation} 2.4s infinite linear both;
      background-color: var(--info);
      transform-origin: 100% 100%;
    }
  `;

  const cubeOrientations = [
    { rotation: "90deg", delay: "0.3s" },
    { rotation: "270deg", delay: "0.9s" },
    { rotation: "180deg", delay: "0.6s" },
  ];

  return (
    <div>
      <div
        className={css`
          margin: 3rem auto;
          width: 6rem;
          height: 6rem;
          transform: rotateZ(45deg);
        `}
      >
        <div className={cubeClass} />
        {cubeOrientations.map(({ rotation, delay }) => (
          <div
            key={rotation}
            className={classnames(
              cubeClass,
              css`
                transform: scale(1.1) rotateZ(${rotation});
                &:before {
                  animation-delay: ${delay};
                }
              `,
            )}
          />
        ))}
      </div>
      <div
        data-testid="loader-message"
        className={css`
          text-align: center;
          font-size: 2rem;
        `}
      >
        {children}
      </div>
    </div>
  );
};

Loader.defaultProps = {
  children: "Loading, please wait...",
};

export default Loader;

import React from 'react';
import cx from 'classnames';
import { css, keyframes } from 'emotion';

interface Props {
  message?: string;
}

const Loader: React.FunctionComponent<Props> = ({ message }) => {
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
      content: '';
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
        <div
          className={cx(
            cubeClass,
            css`
              transform: scale(1.1) rotateZ(90deg);

              &:before {
                animation-delay: 0.3s;
              }
            `,
          )}
        />
        <div
          className={cx(
            cubeClass,
            css`
              transform: scale(1.1) rotateZ(270deg);

              &:before {
                animation-delay: 0.9s;
              }
            `,
          )}
        />
        <div
          className={cx(
            cubeClass,
            css`
              transform: scale(1.1) rotateZ(180deg);

              &:before {
                animation-delay: 0.6s;
              }
            `,
          )}
        />
      </div>
      <div
        className={css`
          text-align: center;
          font-size: 2rem;
        `}
      >
        {message}
      </div>
    </div>
  );
};

Loader.defaultProps = {
  message: 'Loading, please wait...',
};

export default Loader;

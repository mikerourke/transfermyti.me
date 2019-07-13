import React, { useState } from "react";
import { When } from "react-if";
import classnames from "classnames";
import { css } from "emotion";
import Flex from "~/components/flex/Flex";
import SvgIcon, { SvgIconName } from "~/components/svgIcon/SvgIcon";

const BORDER_RAD = "0.5rem";

const InstructionsSection: React.FC = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const { ExpandMore, ExpandLess } = SvgIconName;
  const bottomRadiusClass = css`
    border-bottom-left-radius: ${BORDER_RAD};
    border-bottom-right-radius: ${BORDER_RAD};
  `;

  return (
    <div
      className={css`
        margin-bottom: 1rem;
      `}
    >
      <Flex
        alignItems="center"
        className={classnames(
          css`
            background-color: var(--dark-gray);
            border: 1px solid var(--dark-gray);
            border-top-left-radius: ${BORDER_RAD};
            border-top-right-radius: ${BORDER_RAD};
            color: #fff;
            font-weight: 700;
            line-height: 1.25;
            padding: 0.75rem 1rem;
            position: relative;
          `,
          {
            [bottomRadiusClass]: !isExpanded,
          },
        )}
      >
        <button
          className={css`
            background: transparent;
            border: 0;
            cursor: pointer;
            margin-right: 0.5rem;

            &:focus {
              outline: none;
            }
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SvgIcon
            name={isExpanded ? ExpandLess : ExpandMore}
            color="white"
            height={12}
          />
        </button>
        <span
          className={css`
            cursor: pointer;
            font-size: 18px;
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"} Instructions
        </span>
      </Flex>
      <When condition={isExpanded}>
        <div
          className={classnames(
            css`
              background-color: var(--light-gray);
              border: 1px solid var(--dark-gray);
              color: var(--dark-gray);
              padding: 1rem;
            `,
            bottomRadiusClass,
          )}
        >
          {children}
        </div>
      </When>
    </div>
  );
};

export default InstructionsSection;

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

  const bottomRadiusClass = css({
    borderBottomLeftRadius: BORDER_RAD,
    borderBottomRightRadius: BORDER_RAD,
  });

  return (
    <div
      data-testid="instructions-section"
      className={css({ marginBottom: "1rem" })}
    >
      <Flex
        alignItems="center"
        className={classnames(
          css({
            backgroundColor: "var(--dark-gray)",
            border: "1px solid var(--dark-gray)",
            borderTopLeftRadius: BORDER_RAD,
            borderTopRightRadius: BORDER_RAD,
            color: "#fff",
            fontWeight: 700,
            lineHeight: 1.25,
            padding: "0.75rem 1rem",
            position: "relative",
          }),
          {
            [bottomRadiusClass]: !isExpanded,
          },
        )}
      >
        <button
          data-testid="toggle-expanded-button"
          className={css({
            background: "transparent",
            border: 0,
            cursor: "pointer",
            marginRight: "0.5rem",

            "&:focus": {
              outline: "none",
            },
          })}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SvgIcon
            name={isExpanded ? ExpandLess : ExpandMore}
            color="white"
            height={12}
          />
        </button>
        <span
          data-testid="toggle-expanded-label"
          className={css({ cursor: "pointer", fontSize: 18 })}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"} Instructions
        </span>
      </Flex>
      <When condition={isExpanded}>
        <div
          className={classnames(
            css({
              backgroundColor: "var(--light-gray)",
              border: "1px solid var(--dark-gray)",
              color: "var(--dark-gray)",
              padding: "1rem",
            }),
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

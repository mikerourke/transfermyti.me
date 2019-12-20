import React from "react";
import classnames from "classnames";
import { css } from "emotion";

type GlobalOption = "inherit" | "initial" | "unset";

type CommonPositionalOption =
  | GlobalOption
  | "baseline"
  | "center"
  | "end"
  | "first baseline"
  | "flex-end"
  | "flex-start"
  | "last baseline"
  | "left"
  | "right"
  | "safe center"
  | "start"
  | "stretch"
  | "unsafe center";

type SelfPositionalOption = "normal" | "self-end" | "self-start";

type SpacePositionalOption = "space-around" | "space-between" | "space-evenly";

export interface FlexProps {
  as?: string | React.ReactElement<unknown> | React.ReactNode;
  className?: string;
  alignItems?: CommonPositionalOption | SelfPositionalOption;
  alignSelf?: CommonPositionalOption | SelfPositionalOption;
  justifyContent?: CommonPositionalOption | SpacePositionalOption;
  justifySelf?: CommonPositionalOption | SelfPositionalOption;
  direction?: "column" | "column-reverse" | "row" | "row-reverse";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Flex: React.FC<FlexProps | any> = ({
  as: Element,
  className,
  alignItems,
  alignSelf,
  justifyContent,
  justifySelf,
  direction,
  ...props
}) => {
  const classes = classnames(
    className,
    css({
      display: "flex",
      alignItems,
      alignSelf,
      justifyContent,
      justifySelf,
      flexDirection: direction,
    }),
  );

  return <Element className={classes} {...props} />;
};

Flex.defaultProps = {
  as: "div",
};

export default Flex;

import React from "react";
import * as R from "ramda";

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
  inline?: boolean;
  alignContent?: CommonPositionalOption;
  alignItems?: CommonPositionalOption | SelfPositionalOption;
  alignSelf?: CommonPositionalOption | SelfPositionalOption;
  justifyContent?: CommonPositionalOption | SpacePositionalOption;
  justifySelf?: CommonPositionalOption | SelfPositionalOption;
  direction?: "column" | "column-reverse" | "row" | "row-reverse";
  flex?: number;
  grow?: number;
  shrink?: number;
  wrap?: GlobalOption | "nowrap" | "wrap" | "wrap-reverse";
}

interface Props extends FlexProps, React.HTMLAttributes<HTMLElement> {
  as?: string | React.ReactElement<unknown> | React.ReactNode;
  innerRef?: React.Ref<HTMLElement>;
}

const Flex: React.FC<Props> = ({
  as = "div",
  innerRef,
  inline,
  alignContent,
  alignItems,
  alignSelf,
  justifyContent,
  justifySelf,
  direction,
  flex,
  grow,
  shrink,
  wrap,
  ...props
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Element = as as any;
  return (
    <Element
      ref={R.isNil(innerRef) ? undefined : innerRef}
      css={{
        display: inline ? "inline-flex" : "flex",
        alignContent,
        alignItems,
        alignSelf,
        justifyContent,
        justifySelf,
        flexDirection: direction,
        flex,
        flexGrow: grow,
        flexShrink: shrink,
        flexWrap: wrap,
      }}
      {...props}
    />
  );
};

export default Flex;

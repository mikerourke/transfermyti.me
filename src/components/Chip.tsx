import React from "react";
import { styled, ThemeColors } from "./emotion";
import Flex from "./Flex";

const Root = styled(Flex)<{ color: keyof ThemeColors }>(
  {
    padding: "0.25rem 1rem",
    borderRadius: "4rem",
  },
  ({ color, theme }) => ({
    background: theme.colors[color],
  }),
);

const Text = styled.span(
  {
    fontSize: "1rem",
    fontWeight: "bolder",
  },
  ({ theme }) => ({
    color: theme.colors.white,
  }),
);

interface Props {
  color?: keyof ThemeColors;
}

const Chip: React.FC<Props> = ({ children, color = "eggplant", ...props }) => (
  <Root alignItems="center" justifyContent="center" color={color} {...props}>
    <Text>{children}</Text>
  </Root>
);

export default Chip;

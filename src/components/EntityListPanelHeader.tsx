import React from "react";
import { styled } from "./emotion";
import Button from "./Button";
import Flex from "./Flex";

const ButtonsRow = styled.div(
  {
    button: {
      fontSize: "0.875rem",
      padding: "0.25rem 0.5rem",

      ":not(:last-of-type)": {
        marginRight: "0.75rem",
      },
    },
  },
  ({ theme }) => ({
    button: {
      fontWeight: theme.fontWeights.bold,
    },
  }),
);

interface Props {
  disabled?: boolean;
  title: string;
  titleId: string;
  onUpdateIfAllIncluded: (areAllIncluded: boolean) => void;
}

const EntityListPanelHeader: React.FC<Props> = ({
  disabled = false,
  title,
  titleId,
  onUpdateIfAllIncluded,
  ...props
}) => (
  <Flex alignItems="center" justifyContent="space-between" {...props}>
    <h4 id={titleId}>{title}</h4>
    <ButtonsRow>
      <Button
        disabled={disabled}
        variant="outlinePrimary"
        onClick={() => onUpdateIfAllIncluded(true)}
      >
        Include All
      </Button>
      <Button
        disabled={disabled}
        variant="outlineDefault"
        onClick={() => onUpdateIfAllIncluded(false)}
      >
        Exclude All
      </Button>
    </ButtonsRow>
  </Flex>
);

export default EntityListPanelHeader;

import React, { useState } from "react";
import { When } from "react-if";
import styled from "@emotion/styled";
import Flex from "../Flex";
import Icon from "../Icon";

const BORDER_RAD = "0.5rem";

const Button = styled.button({
  background: "transparent",
  border: 0,
  cursor: "pointer",
  marginRight: "0.5rem",

  "&:focus": {
    outline: "none",
  },
});

const Title = styled(Flex)({
  backgroundColor: "var(--dark-gray)",
  border: "1px solid var(--dark-gray)",
  borderTopLeftRadius: BORDER_RAD,
  borderTopRightRadius: BORDER_RAD,
  color: "#fff",
  fontWeight: 700,
  lineHeight: 1.25,
  padding: "0.75rem 1rem",
  position: "relative",
});

const Contents = styled.div({
  backgroundColor: "var(--light-gray)",
  border: "1px solid var(--dark-gray)",
  color: "var(--dark-gray)",
  padding: "1rem",
});

const InstructionsSection: React.FC = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const bottomRadiusStyles = {
    borderBottomLeftRadius: !isExpanded ? BORDER_RAD : undefined,
    borderBottomRightRadius: !isExpanded ? BORDER_RAD : undefined,
  };

  return (
    <div data-testid="instructions-section" css={{ marginBottom: "1rem" }}>
      <Title alignItems="center" css={bottomRadiusStyles}>
        <Button
          data-testid="toggle-expanded-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon
            name={isExpanded ? "expandLess" : "expandMore"}
            color="white"
            height={12}
          />
        </Button>
        <span
          data-testid="toggle-expanded-label"
          css={{ cursor: "pointer", fontSize: 18 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide" : "Show"} Instructions
        </span>
      </Title>
      <When condition={isExpanded}>
        <Contents css={bottomRadiusStyles}>{children}</Contents>
      </When>
    </div>
  );
};

export default InstructionsSection;

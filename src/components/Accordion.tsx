import React from "react";
import Icon from "~/components/Icon";
import { styled } from "./emotion";

const ToggleButton = styled.button(
  {
    alignItems: "center",
    appearance: "none",
    display: "flex",
    fontSize: "1rem",
    justifyContent: "space-between",
    marginBottom: "1rem",
    padding: "0.75rem 1rem",
    textAlign: "left",
    width: "100%",
  },
  ({ theme }) => ({
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.manatee}`,
    borderRadius: "0.375rem",

    "&:hover": {
      backgroundColor: theme.colors.cornflower,
      color: theme.colors.white,
      textDecoration: "underline",

      path: {
        fill: theme.colors.white,
      },
    },
  }),
);

export const Accordion: React.FC = ({ children, ...props }) => (
  <section {...props}>
    <div role="presentation">{children}</div>
  </section>
);

export const AccordionPanel: React.FC<{
  rowNumber: number;
  title: React.ReactNode;
}> = ({ rowNumber, title, children, ...props }) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const titleId = `accordion-title-${rowNumber}`;
  const contentId = `accordion-content-${rowNumber}`;
  return (
    <div {...props}>
      <h3 css={{ margin: 0 }}>
        <ToggleButton
          id={titleId}
          aria-controls={contentId}
          aria-selected={false}
          aria-expanded={isExpanded}
          tabIndex={rowNumber - 1}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{title}</span>
          <Icon
            color="cornflower"
            name={isExpanded ? "circleRemove" : "circleAdd"}
            size={32}
          />
        </ToggleButton>
      </h3>
      <div
        id={contentId}
        css={{ marginBottom: "1rem", display: isExpanded ? "block" : "none" }}
        role="region"
        aria-hidden={!isExpanded}
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

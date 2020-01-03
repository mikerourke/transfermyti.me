import React from "react";
import Icon from "./Icon";
import { styled } from "./emotion";

const ToggleButton = styled.button(
  {
    alignItems: "center",
    appearance: "none",
    display: "flex",
    fontSize: "1.25rem",
    justifyContent: "space-between",
    marginBottom: "1rem",
    padding: "0.75rem 1rem",
    textAlign: "left",
    width: "100%",
  },
  ({ theme }) => ({
    backgroundColor: theme.colors.white,
    borderRadius: "0.375rem",
    boxShadow: theme.elevation.dp2,
    color: theme.colors.primary,

    "&:hover": {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      textDecoration: "underline",

      path: {
        fill: theme.colors.white,
      },
    },
  }),
);

const Content = styled.div({
  marginBottom: "2rem",
  padding: "0 1rem",
});

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
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {title}
          <Icon
            color="primary"
            name={isExpanded ? "circleRemove" : "circleAdd"}
            size={32}
          />
        </ToggleButton>
      </h3>
      <Content
        id={contentId}
        css={{ display: isExpanded ? "block" : "none" }}
        role="region"
        aria-hidden={!isExpanded}
        aria-labelledby={titleId}
      >
        {children}
      </Content>
    </div>
  );
};

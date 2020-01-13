import React from "react";
import AccordionContent from "./AccordionContent";
import AccordionToggle from "./AccordionToggle";

interface Props {
  rowNumber: number;
  title: string;
}

const AccordionPanel: React.FC<Props> = ({
  children,
  rowNumber,
  title,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const titleId = `accordion-title-${rowNumber}`;
  const contentId = `accordion-content-${rowNumber}`;

  return (
    <div {...props}>
      <AccordionToggle
        id={titleId}
        aria-controls={contentId}
        isExpanded={isExpanded}
        onToggle={setIsExpanded}
      >
        {title}
      </AccordionToggle>
      <AccordionContent
        id={contentId}
        aria-labelledby={titleId}
        isExpanded={isExpanded}
      >
        {children}
      </AccordionContent>
    </div>
  );
};

export default AccordionPanel;

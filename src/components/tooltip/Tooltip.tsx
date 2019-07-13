import React from "react";
import ReactTooltip from "react-tooltip";

// Needed this due to outdated type definitions for react-tooltip:
interface TooltipProps extends ReactTooltip.Props {
  delayUpdate?: number;
}

const CustomTooltip: React.FC<TooltipProps> = props => (
  <ReactTooltip {...props} />
);

interface Props extends TooltipProps {
  id: string;
}

const Tooltip: React.FC<Props> = ({ id, children, ...tooltipProps }) => (
  <CustomTooltip
    id={id}
    border
    effect="solid"
    delayHide={500}
    delayShow={100}
    delayUpdate={500}
    place="right"
    type="light"
    {...tooltipProps}
  >
    {children}
  </CustomTooltip>
);

export default Tooltip;

import React from "react";
import ReactTooltip from "react-tooltip";

const CustomTooltip: React.FC<ReactTooltip.Props> = props => (
  <ReactTooltip {...props} />
);

interface Props extends ReactTooltip.Props {
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

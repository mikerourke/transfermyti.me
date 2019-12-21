import React from "react";
import { Message } from "rsuite";

interface Props {
  title: string;
}

const HelpMessage: React.FC<Props> = props => (
  <Message
    closable
    showIcon
    type="info"
    title={props.title}
    description={<p>{props.children}</p>}
  />
);

export default HelpMessage;

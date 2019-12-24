import React from "react";
import { HelpBlock } from "rsuite";
import { ExternalLink } from "~/components";
import { ToolHelpDetailsModel } from "~/app/appTypes";

type Props = Omit<ToolHelpDetailsModel, "toolName">;

const ToolHelpBlock: React.FC<Props> = ({ displayName, toolLink }) => (
  <HelpBlock css={{ a: { marginLeft: 4 } }}>
    API key associated with your {displayName} account. You can find it on
    <ExternalLink href={toolLink}>your {displayName} profile page</ExternalLink>
    .
  </HelpBlock>
);

export default ToolHelpBlock;

import React from "react";
import { HelpBlock } from "rsuite";
import { ExternalLink } from "~/components";
import { ToolName } from "~/common/commonTypes";

const ToolHelpBlock: React.FC<{
  displayName: string;
  toolName: ToolName;
}> = ({ displayName, toolName }) => {
  const toolLink = {
    [ToolName.Clockify]: "https://clockify.me/user/settings",
    [ToolName.Toggl]: "https://toggl.com/app/profile",
  }[toolName];

  return (
    <HelpBlock css={{ a: { marginLeft: 4 } }}>
      API key associated with your {displayName} account. You can find it on
      <ExternalLink href={toolLink}>
        your {displayName} profile page
      </ExternalLink>
      .
    </HelpBlock>
  );
};

export default ToolHelpBlock;

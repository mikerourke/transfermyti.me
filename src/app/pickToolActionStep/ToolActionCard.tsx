import React from "react";
import { Button, Card } from "~/components";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { ToolAction } from "~/app/appTypes";

interface Props {
  action: ToolAction;
  header: React.ReactNode;
  source: ToolName;
  target: ToolName;
  onSelectClick: (
    action: ToolAction,
    source: ToolName,
    target: ToolName,
  ) => void;
}

const ToolActionCard: React.FC<Props> = ({
  action,
  children,
  header,
  source,
  target,
  onSelectClick,
  ...props
}) => (
  <Card title={header} {...props}>
    <p css={{ margin: "0 0 2rem 0" }}>{children}</p>
    <Button
      css={{ marginTop: "auto", width: "fit-content" }}
      variant="secondary"
      onClick={() => onSelectClick(action, source, target)}
    >
      Select
    </Button>
  </Card>
);

export default ToolActionCard;

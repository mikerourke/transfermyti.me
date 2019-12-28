import React from "react";
import { Button, Card } from "~/components";

interface Props {
  header: React.ReactNode;
  onTransferClick: VoidFunction;
}

const TransferMappingCard: React.FC<Props> = props => (
  <Card title={props.header}>
    <p css={{ marginBottom: "2rem" }}>{props.children}</p>
    <Button color="cornflower" onClick={props.onTransferClick}>
      Select
    </Button>
  </Card>
);

export default TransferMappingCard;

import React from "react";
import { FlexboxGrid, Panel, Button } from "rsuite";

interface Props {
  header: React.ReactNode;
  onTransferClick: VoidFunction;
}

const TransferMappingCard: React.FC<Props> = props => (
  <FlexboxGrid.Item css={{ margin: "0 1rem 2rem", flex: "0 0 16rem" }}>
    <Panel bordered header={props.header} css={{ width: 240 }}>
      <p css={{ marginBottom: "2rem" }}>{props.children}</p>
      <Button appearance="primary" onClick={props.onTransferClick}>
        Select
      </Button>
    </Panel>
  </FlexboxGrid.Item>
);

export default TransferMappingCard;

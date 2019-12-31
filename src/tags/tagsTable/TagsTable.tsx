import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTagIncluded } from "~/tags/tagsActions";
import { tagsForTableViewSelector } from "~/tags/tagsSelectors";
import { AccordionPanel, EntitiesTable } from "~/components";
import { TableViewModel } from "~/allEntities/allEntitiesTypes";
import { TagModel } from "~/tags/tagsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  tags: TableViewModel<TagModel>[];
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TagsTableComponent: React.FC<Props> = props => (
  <AccordionPanel
    rowNumber={3}
    title={<span>Tags | Count: {props.tags.length}</span>}
  >
    <EntitiesTable
      tableFields={[
        { label: "Name", field: "name" },
        { label: "Time Entry Count", field: "entryCount" },
      ]}
      tableData={props.tags}
      onFlipIsIncluded={props.onFlipIsIncluded}
    />
  </AccordionPanel>
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tags: tagsForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTagIncluded,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsTableComponent);

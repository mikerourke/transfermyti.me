import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTagIncluded } from "~/tags/tagsActions";
import { tagsForTableViewSelector } from "~/tags/tagsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
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
  <EntityListPanel
    entityGroup={EntityGroup.Tags}
    rowNumber={3}
    tableData={props.tags}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entries", field: "entryCount" },
    ]}
    onFlipIsIncluded={props.onFlipIsIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tags: tagsForTableViewSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTagIncluded,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsTableComponent);

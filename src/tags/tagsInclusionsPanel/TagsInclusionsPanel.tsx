import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  flipIsTagIncluded,
  updateAreAllTagsIncluded,
} from "~/tags/tagsActions";
import {
  tagsForInclusionTableSelector,
  tagsTotalCountsByTypeSelector,
} from "~/tags/tagsSelectors";
import { EntityGroupInclusionsPanel } from "~/components";
import { EntityGroup, ReduxState, TableViewModel, TagModel } from "~/typeDefs";

interface ConnectStateProps {
  tags: TableViewModel<TagModel>[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateAreAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TagsInclusionsPanelComponent: React.FC<Props> = props => (
  <EntityGroupInclusionsPanel
    entityGroup={EntityGroup.Tags}
    rowNumber={2}
    tableData={props.tags}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entry Count", field: "entryCount" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
    onUpdateAreAllIncluded={props.onUpdateAreAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tags: tagsForInclusionTableSelector(state),
  totalCountsByType: tagsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTagIncluded,
  onUpdateAreAllIncluded: updateAreAllTagsIncluded,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TagsInclusionsPanelComponent);

import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTagIncluded, updateIfAllTagsIncluded } from "~/tags/tagsActions";
import {
  tagsForTableViewSelector,
  tagsTotalCountsByTypeSelector,
} from "~/tags/tagsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { TagModel } from "~/tags/tagsTypes";

interface ConnectStateProps {
  tags: TableViewModel<TagModel>[];
  totalCountsByType: Record<string, number>;
}

interface ConnectDispatchProps {
  onFlipIsIncluded: PayloadActionCreator<string, string>;
  onUpdateIfAllIncluded: PayloadActionCreator<string, boolean>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const TagsTableComponent: React.FC<Props> = props => (
  <EntityListPanel
    entityGroup={EntityGroup.Tags}
    rowNumber={2}
    tableData={props.tags}
    tableFields={[
      { label: "Name", field: "name" },
      { label: "Time Entry Count", field: "entryCount" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
    onUpdateIfAllIncluded={props.onUpdateIfAllIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tags: tagsForTableViewSelector(state),
  totalCountsByType: tagsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTagIncluded,
  onUpdateIfAllIncluded: updateIfAllTagsIncluded,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsTableComponent);

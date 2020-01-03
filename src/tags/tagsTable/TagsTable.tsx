import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { flipIsTagIncluded } from "~/tags/tagsActions";
import {
  tagsForTableViewSelector,
  tagsTotalCountsByTypeSelector,
} from "~/tags/tagsSelectors";
import { EntityListPanel } from "~/components";
import { EntityGroup, TableViewModel } from "~/allEntities/allEntitiesTypes";
import { TagModel } from "~/tags/tagsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  tags: TableViewModel<TagModel>[];
  totalCountsByType: Record<string, number>;
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
      { label: "Time Entry Count", field: "entryCount" },
    ]}
    totalCountsByType={props.totalCountsByType}
    onFlipIsIncluded={props.onFlipIsIncluded}
  />
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  tags: tagsForTableViewSelector(state),
  totalCountsByType: tagsTotalCountsByTypeSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFlipIsIncluded: flipIsTagIncluded,
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsTableComponent);

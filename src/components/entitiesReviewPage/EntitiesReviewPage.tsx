import React, { useState } from 'react';
import first from 'lodash/first';
import get from 'lodash/get';
import StepPage from '~/components/stepPage/StepPage';
import EntitiesList from '~/components/entitiesList/EntitiesList';
import EntityTabs from './components/EntityTabs';
import NoRecordsDisplay from './components/NoRecordsDisplay';
import WorkspacesDropdown from './components/WorkspacesDropdown';
import { EntityGroup, EntityModel } from '~/types/commonTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

interface Props {
  title: string;
  subtitle: string;
  previous: () => void;
  next: () => void;
  entitiesByWorkspaceId: Record<string, Record<EntityGroup, EntityModel[]>>;
  workspacesById: Record<string, WorkspaceModel>;
  onRefreshClick?: () => void;
  onUpdateIsWorkspaceEntityIncluded?: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => void;
}

const CONTENTS_HEIGHT = 448;

const EntitiesReviewPage: React.FunctionComponent<Props> = ({
  children,
  entitiesByWorkspaceId,
  workspacesById,
  onUpdateIsWorkspaceEntityIncluded,
  ...stepPageProps
}) => {
  const [workspaceId, setWorkspaceId] = useState(
    first(Object.keys(workspacesById)),
  );
  const [entityGroup, setEntityGroup] = useState(EntityGroup.Projects);
  const [contentsWidth, setContentsWidth] = useState(0);

  const activeEntityRecords = get(
    entitiesByWorkspaceId,
    [workspaceId, entityGroup],
    [],
  );

  return (
    <StepPage onResize={setContentsWidth} {...stepPageProps}>
      {children}
      <WorkspacesDropdown
        workspacesById={workspacesById}
        activeWorkspaceId={workspaceId}
        onItemClick={setWorkspaceId}
      />
      <EntityTabs activeTab={entityGroup} onTabClick={setEntityGroup} />
      {activeEntityRecords.length === 0 ? (
        <NoRecordsDisplay
          height={CONTENTS_HEIGHT}
          activeEntityGroup={entityGroup}
        />
      ) : (
        <EntitiesList
          entityGroup={entityGroup}
          entityRecords={activeEntityRecords}
          height={CONTENTS_HEIGHT}
          width={contentsWidth}
          onItemClick={onUpdateIsWorkspaceEntityIncluded}
        />
      )}
    </StepPage>
  );
};

export default EntitiesReviewPage;

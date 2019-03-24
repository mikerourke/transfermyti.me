import React, { useState } from 'react';
import { first, get } from 'lodash';
import StepPage, { StepPageProps } from '~/components/stepPage/StepPage';
import EntitiesList from '~/components/entitiesList/EntitiesList';
import EntityTabs from './components/EntityTabs';
import NoRecordsDisplay from './components/NoRecordsDisplay';
import WorkspacesDropdown from './components/WorkspacesDropdown';
import { EntityModel, ToolName } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

interface Props extends StepPageProps {
  subtitle: string;
  toolName: ToolName;
  entitiesByWorkspaceId: Record<string, Record<EntityGroup, EntityModel[]>>;
  workspacesById: Record<string, WorkspaceModel>;
  onRefreshClick?: () => void;
  onFlipIsWorkspaceEntityIncluded?: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => void;
}

const CONTENTS_HEIGHT = 448;

const EntitiesReviewPage: React.FC<Props> = ({
  children,
  toolName,
  entitiesByWorkspaceId,
  workspacesById,
  onFlipIsWorkspaceEntityIncluded,
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
          activeEntityGroup={entityGroup}
          height={CONTENTS_HEIGHT}
          toolName={toolName}
        />
      ) : (
        <EntitiesList
          entityGroup={entityGroup}
          entityRecords={activeEntityRecords}
          height={CONTENTS_HEIGHT}
          width={contentsWidth}
          onItemClick={onFlipIsWorkspaceEntityIncluded}
        />
      )}
    </StepPage>
  );
};

export default EntitiesReviewPage;

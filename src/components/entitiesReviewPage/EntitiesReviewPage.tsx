import React, { useState } from 'react';
import { first, get, isNil } from 'lodash';
import { css } from 'emotion';
import EntitiesList from '~/components/entitiesList/EntitiesList';
import StepPage, { StepPageProps } from '~/components/stepPage/StepPage';
import EntityTabs from './components/EntityTabs';
import NoRecordsDisplay from './components/NoRecordsDisplay';
import TotalsFooter from './components/TotalsFooter';
import WorkspacesDropdown from './components/WorkspacesDropdown';
import {
  CompoundEntityModel,
  CompoundWorkspaceModel,
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
  EntityGroup,
  ToolName,
} from '~/types';

interface Props extends StepPageProps {
  subtitle: string;
  toolName: ToolName;
  countsByGroupByWorkspace: CountsByGroupByWorkspaceModel;
  entitiesByGroupByWorkspace: EntitiesByGroupByWorkspaceModel;
  workspacesById: Record<string, CompoundWorkspaceModel>;
  onRefreshClick?: () => void;
  onFlipIsWorkspaceEntityIncluded?: (
    entityGroup: EntityGroup,
    entityRecord: CompoundEntityModel,
  ) => void;
}

const CONTENTS_HEIGHT = 600;

const EntitiesReviewPage: React.FC<Props> = ({
  toolName,
  countsByGroupByWorkspace,
  entitiesByGroupByWorkspace,
  workspacesById,
  onFlipIsWorkspaceEntityIncluded,
  ...stepPageProps
}) => {
  const [workspaceId, setWorkspaceId] = useState<string>(
    first(Object.keys(workspacesById)),
  );
  const [activeEntityGroup, setActiveEntityGroup] = useState<EntityGroup>(
    EntityGroup.Projects,
  );
  const [contentsWidth, setContentsWidth] = useState<number>(0);
  const [showInclusionsOnly, setShowInclusionsOnly] = useState<boolean>(false);

  let activeEntityRecords = get(
    entitiesByGroupByWorkspace,
    [workspaceId, activeEntityGroup],
    [],
  );

  if (showInclusionsOnly && activeEntityRecords.length !== 0) {
    activeEntityRecords = activeEntityRecords.reduce(
      (acc: Array<CompoundEntityModel>, entityRecord: CompoundEntityModel) => {
        if (!entityRecord.isIncluded) return acc;
        if (!isNil(entityRecord.linkedId)) return acc;
        return [...acc, entityRecord];
      },
      [],
    );
  }

  const groupRecordCounts = get(
    countsByGroupByWorkspace,
    [workspaceId, activeEntityGroup],
    {},
  );

  return (
    <StepPage onResize={setContentsWidth} {...stepPageProps}>
      <div
        className={css`
          margin-bottom: 1rem;
          position: relative;
        `}
      >
        <EntityTabs
          activeTab={activeEntityGroup}
          onTabClick={setActiveEntityGroup}
        />
        <WorkspacesDropdown
          workspacesById={workspacesById}
          activeWorkspaceId={workspaceId}
          onItemClick={setWorkspaceId}
        />
      </div>
      {activeEntityRecords.length === 0 ? (
        <NoRecordsDisplay
          activeEntityGroup={activeEntityGroup}
          height={CONTENTS_HEIGHT}
          toolName={toolName}
        />
      ) : (
        <EntitiesList
          entityGroup={activeEntityGroup}
          entityRecords={activeEntityRecords}
          height={CONTENTS_HEIGHT}
          width={contentsWidth}
          onItemClick={onFlipIsWorkspaceEntityIncluded}
        />
      )}
      <TotalsFooter
        activeEntityGroup={activeEntityGroup}
        groupRecordCounts={groupRecordCounts}
        showInclusionsOnly={showInclusionsOnly}
        onFlipInclusionsOnly={() => setShowInclusionsOnly(!showInclusionsOnly)}
      />
    </StepPage>
  );
};

export default EntitiesReviewPage;

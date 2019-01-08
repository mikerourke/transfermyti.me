import React, { useState } from 'react';
import get from 'lodash/get';
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from 'bloomer';
import { css } from 'emotion';
import Flex from '../../flex/Flex';
import ChevronDownIcon from './ChevronDownIcon';
import { WorkspaceModel } from '../../../types/workspacesTypes';

interface Props {
  workspacesById: Record<string, WorkspaceModel>;
  activeWorkspaceId: string;
  onItemClick: (workspaceId: string) => void;
}

const WorkspacesDropdown: React.FunctionComponent<Props> = ({
  workspacesById,
  activeWorkspaceId,
  onItemClick,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleItemClick = (workspaceId: string) => {
    onItemClick(workspaceId);
    setIsActive(false);
  };

  return (
    <Flex
      direction="column"
      className={css`
        margin-bottom: 1rem;
      `}
    >
      <div
        className={css`
          font-size: 14px;
          font-weight: 700;
          color: var(--info);
          margin: 0.25rem;
          text-transform: uppercase;
        `}
      >
        Select a Workspace:
      </div>
      <Dropdown
        isActive={isActive}
        className={css`
          min-width: 12rem;
        `}
      >
        <DropdownTrigger
          className={css`
            width: 12rem;
          `}
        >
          <Button
            isOutlined
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            className={css`
              width: 100%;
              justify-content: space-between;
            `}
            onClick={() => setIsActive(!isActive)}
          >
            <span>{get(workspacesById, [activeWorkspaceId, 'name'], '')}</span>
            <ChevronDownIcon />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownContent>
            {Object.values(workspacesById).map(({ id, name }) => (
              <DropdownItem
                key={id}
                className={css`
                  cursor: pointer;
                  &:hover {
                    background-color: var(--info);
                    color: white;
                  }
                `}
                onClick={() => handleItemClick(id)}
              >
                {name}
              </DropdownItem>
            ))}
          </DropdownContent>
        </DropdownMenu>
      </Dropdown>
    </Flex>
  );
};

export default WorkspacesDropdown;

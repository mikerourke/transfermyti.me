import React, { useState } from 'react';
import { get } from 'lodash';
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from 'bloomer';
import { css } from 'emotion';
import ChevronDownIcon from './ChevronDownIcon';
import { WorkspaceModel } from '~/types/workspacesTypes';

interface Props {
  workspacesById: Record<string, WorkspaceModel>;
  activeWorkspaceId: string;
  onItemClick: (workspaceId: string) => void;
}

const MIN_WIDTH = '14rem';

const WorkspacesDropdown: React.FC<Props> = ({
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
    <Dropdown
      isActive={isActive}
      className={css`
        margin-bottom: 0.5rem;
        min-width: ${MIN_WIDTH};
      `}
    >
      <DropdownTrigger
        className={css`
          min-width: ${MIN_WIDTH};
        `}
      >
        <Button
          isOutlined
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          className={css`
            font-size: 1.25rem;
            font-weight: bold;
            width: 100%;
            justify-content: space-between;
          `}
          onClick={() => setIsActive(!isActive)}
        >
          <span>{get(workspacesById, [activeWorkspaceId, 'name'], '')}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        className={css`
          min-width: ${MIN_WIDTH};
        `}
      >
        <DropdownContent>
          {Object.values(workspacesById).map(({ id, name }) => (
            <DropdownItem
              key={id}
              className={css`
                cursor: pointer;
                font-size: 1.25rem;
                font-weight: bold;

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
  );
};

export default WorkspacesDropdown;

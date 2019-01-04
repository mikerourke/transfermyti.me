import React, { Component } from 'react';
import { css } from 'emotion';
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from 'bloomer';
import ChevronDownIcon from './ChevronDownIcon';
import { WorkspaceModel } from '../../../../types/workspacesTypes';

interface Props {
  workspacesById: Record<string, WorkspaceModel>;
  activeWorkspaceId: string;
  onItemClick: (workspaceId: string) => void;
}

interface State {
  isActive: boolean;
}

class WorkspacesDropdown extends Component<Props, State> {
  state = {
    isActive: false,
  };

  private handleTriggerClick = () => {
    this.setState(({ isActive }) => ({ isActive: !isActive }));
  };

  private handleItemClick = (workspaceId: string) => () => {
    this.props.onItemClick(workspaceId);
    this.setState({ isActive: false });
  };

  public render() {
    const { workspacesById, activeWorkspaceId } = this.props;
    return (
      <div
        className={css`
          display: flex;
          flex-direction: column;
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
          isActive={this.state.isActive}
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
              onClick={this.handleTriggerClick}
            >
              <span>{workspacesById[activeWorkspaceId].name}</span>
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
                  onClick={this.handleItemClick(id)}
                >
                  {name}
                </DropdownItem>
              ))}
            </DropdownContent>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}

export default WorkspacesDropdown;

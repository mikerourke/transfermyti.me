import React, { useState } from "react";
import { get } from "lodash";
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "bloomer";
import { css } from "emotion";
import Icon from "~/components/Icon";
import { CompoundWorkspaceModel } from "~/workspaces/workspacesTypes";

interface Props {
  workspacesById: Record<string, CompoundWorkspaceModel>;
  activeWorkspaceId: string;
  onItemClick: (workspaceId: string) => void;
}

const MIN_WIDTH = "12rem";

const WorkspacesDropdown: React.FC<Props> = ({
  workspacesById,
  activeWorkspaceId,
  onItemClick,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleItemClick = (workspaceId: string): void => {
    onItemClick(workspaceId);
    setIsActive(false);
  };

  return (
    <Dropdown
      data-testid="workspaces-dropdown"
      isActive={isActive}
      className={css({
        minWidth: MIN_WIDTH,
        position: "absolute",
        top: 0,
        right: 0,
      })}
    >
      <DropdownTrigger className={css({ minWidth: MIN_WIDTH })}>
        <Button
          data-testid="workspaces-dropdown-trigger-button"
          isOutlined
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          className={css({
            fontSize: "1rem",
            fontWeight: "bold",
            width: "100%",
            justifyContent: "space-between",
          })}
          onClick={() => setIsActive(!isActive)}
        >
          <span>{get(workspacesById, [activeWorkspaceId, "name"], "")}</span>
          <Icon
            name="expandMore"
            color="var(--dark-gray)"
            height={16}
            width={16}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu className={css({ minWidth: MIN_WIDTH })}>
        <DropdownContent>
          {Object.values(workspacesById).map(({ id, name }) => (
            <DropdownItem
              data-testid="workspaces-dropdown-item"
              key={id}
              className={css({
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",

                "&:hover": {
                  backgroundColor: "var(--info)",
                  color: "white",
                },
              })}
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

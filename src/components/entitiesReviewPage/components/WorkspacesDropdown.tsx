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
import SvgIcon, { SvgIconName } from "~/components/svgIcon/SvgIcon";
import { CompoundWorkspaceModel } from "~/types";

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

  const handleItemClick = (workspaceId: string) => {
    onItemClick(workspaceId);
    setIsActive(false);
  };

  return (
    <Dropdown
      isActive={isActive}
      className={css`
        min-width: ${MIN_WIDTH};
        position: absolute;
        top: 0;
        right: 0;
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
            font-size: 1rem;
            font-weight: bold;
            width: 100%;
            justify-content: space-between;
          `}
          onClick={() => setIsActive(!isActive)}
        >
          <span>{get(workspacesById, [activeWorkspaceId, "name"], "")}</span>
          <SvgIcon
            name={SvgIconName.ExpandMore}
            color="var(--dark-gray)"
            height={16}
            width={16}
          />
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
                font-size: 1rem;
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

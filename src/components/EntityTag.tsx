import React from "react";
import { Tag } from "bloomer";

export enum EntityTagType {
  Archived = "Archived",
  Excluded = "Excluded",
  Existing = "Existing",
}

interface Props {
  size: "small" | "large";
  tagType: EntityTagType;
}

const EntityTag: React.FC<Props> = ({ size, tagType }) => {
  const entryStyle =
    size === "small" ? { height: "1.5rem", fontSize: "0.675rem" } : {};

  const color = {
    [EntityTagType.Archived]: "warning",
    [EntityTagType.Excluded]: "danger",
    [EntityTagType.Existing]: "info",
  }[tagType];

  return (
    <Tag
      data-testid="entity-tag"
      isColor={color}
      css={{ fontWeight: "bold", marginRight: "0.625rem" }}
      style={entryStyle}
    >
      {tagType}
    </Tag>
  );
};

export default EntityTag;

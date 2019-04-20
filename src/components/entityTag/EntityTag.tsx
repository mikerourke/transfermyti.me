import React from 'react';
import { css } from 'emotion';
import { Tag } from 'bloomer';

export enum EntityTagType {
  Archived = 'Archived',
  Excluded = 'Excluded',
  Existing = 'Existing',
}

interface Props {
  size: 'small' | 'large';
  tagType: EntityTagType;
}

const EntityTag: React.FC<Props> = ({ size, tagType }) => {
  const tagClass = css`
    font-weight: bold;
    margin-right: 0.625rem;
  `;

  const entryStyle =
    size === 'small' ? { height: '1.5rem', fontSize: '0.675rem' } : {};

  const color = {
    [EntityTagType.Archived]: 'warning',
    [EntityTagType.Excluded]: 'danger',
    [EntityTagType.Existing]: 'info',
  }[tagType];

  return (
    <Tag isColor={color} className={tagClass} style={entryStyle}>
      {tagType}
    </Tag>
  );
};

export default EntityTag;

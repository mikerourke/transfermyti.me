import React from 'react';
import iconProps from './iconProps';

export enum SvgIconName {
  GitHub = "github",
  Heart = "heart",
  Person = "person",
  People = "people",
}

interface Props extends React.SVGAttributes<SVGElement> {
  name: SvgIconName;
  color: string;
  classes?: {
    svg?: string;
    path?: string;
  };
}

const SvgIcon: React.FC<Props> = ({ name, color, classes, ...svgProps }) => (
  <svg
    className={classes.svg}
    viewBox={iconProps[name].viewBox}
    {...svgProps}
  >
    <path className={classes.path} d={iconProps[name].path} fill={color} />
  </svg>
);

SvgIcon.defaultProps = {
  classes: {
    svg: '',
    path: '',
  },
};

export default SvgIcon;

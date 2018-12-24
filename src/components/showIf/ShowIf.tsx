import React from 'react';

interface Props {
  isShown: boolean;
  as?: string | React.ReactElement<any> | React.ReactNode;
}

/**
 * Simple component to show child elements only if the specified conditions
 *    are met.
 * @param isShown Indicates if the element should be shown.
 * @param [as="div"] Type of element to render, could be a string or component.
 * @param ...props Props associated with the wrapping element.
 * @constructor
 */
const ShowIf: React.FunctionComponent<Props | any> = ({
  isShown,
  as,
  children,
  ...props
}) => {
  if (!isShown) return null;

  const Element = as;
  return <Element {...props}>{children}</Element>;
};

ShowIf.defaultProps = {
  as: 'div',
  children: null,
};

export default ShowIf;

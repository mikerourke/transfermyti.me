import React from "react";
import { TransitionStatus } from "react-transition-group/Transition";

import { styled, useTheme } from "~/components";
import { NotificationModel } from "~/typeDefs";

const StyledDiv = styled.div`
  position: absolute;
  right: 1rem;
  width: 20rem;
  padding: 1rem;
  border: none;
  border-radius: 0.375rem;
  transition: top 500ms ease-out;
  background-color: var(--color-midnight);
  box-shadow: var(--elevation-dp4);
  color: var(--color-white);
  height: var(--height-notification);
  z-index: var(--z-index-notification);

  span {
    position: absolute;
    bottom: 2.25rem;
    right: -1.375rem;
    height: 0;
    width: 0;
    border-style: solid;
    border-width: 1.5rem 1rem 0;
    border-color: var(--color-midnight) transparent transparent transparent;
    pointer-events: none;
    transform: rotate(270deg);
  }
`;

interface Props {
  index: number;
  notification: NotificationModel;
  transitionStatus: TransitionStatus;
  onDismissNotification: (notificationId: string) => void;
}

const NotificationToast: React.FC<Props> = ({
  index,
  notification,
  transitionStatus,
  onDismissNotification,
  ...props
}) => {
  const { sizes } = useTheme();

  React.useEffect(() => {
    setTimeout(() => {
      onDismissNotification(notification.id);
    }, 5_000);
  }, []);

  // @ts-ignore
  const animation = {
    entering: `slide-in-right 300ms 1 linear both`,
    exiting: `slide-out-left 600ms 1 linear both`,
  }[transitionStatus];

  // Height of notification plus 1rem for bottom padding:
  const topRems = index * (sizes.notificationHeight + sizes.notificationGap);

  return (
    <StyledDiv
      role="status"
      style={{ animation, top: `${topRems}rem` }}
      {...props}
    >
      {notification.message}

      <span />
    </StyledDiv>
  );
};

export default NotificationToast;

import React from "react";
import { connect } from "react-redux";
import { TransitionGroup, Transition } from "react-transition-group";

import { styled, useTheme } from "~/components";
import NotificationToast from "~/layout/NotificationToast";
import { dismissNotification } from "~/modules/app/appActions";
import { notificationsSelector } from "~/modules/app/appSelectors";
import { NotificationModel, ReduxState } from "~/typeDefs";

const StyledDiv = styled.div`
  position: absolute;
  top: 4rem;
  right: 0;
  bottom: 6rem;
  width: 0;
`;

const StyledCountIndicator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  transition: opacity 300ms ease-in;
  z-index: 4;
  background-color: var(--color-secondary);
  color: var(--color-midnight);
  font-weight: var(--font-weight-bold);
`;

export interface ConnectStateProps {
  notifications: NotificationModel[];
}

export interface ConnectDispatchProps {
  onDismissNotification: (notificationId: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const NotificationsDisplayComponent: React.FC<Props> = (props) => {
  const { sizes } = useTheme();
  const paddedNotificationHeight =
    sizes.notificationHeight + sizes.notificationGap;

  const baseRef = React.useRef<HTMLDivElement>(null);
  const [showCounter, setShowCounter] = React.useState<boolean>(false);
  const [currentMaxIndex, setCurrentMaxIndex] = React.useState<number>(0);
  const [maxIndexAllowed, setMaxIndexAllowed] = React.useState<number>(0);

  const fontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );

  const recalculateBaseHeight = (): void => {
    if (baseRef.current) {
      const { height } = baseRef.current.getBoundingClientRect();
      // Get the height of the notifications display in rems:
      const baseHeightInRems = Math.floor(height / fontSize);

      // Determine the maximum amount of notifications we want to show:
      const maxNotifications = Math.floor(
        baseHeightInRems / paddedNotificationHeight,
      );

      // Set the maximum index to the max notifications - 1 to ensure there
      // isn't any overflow:
      setMaxIndexAllowed(maxNotifications - 1);
    }
  };

  React.useEffect(() => {
    recalculateBaseHeight();
    window.addEventListener("resize", recalculateBaseHeight);

    return () => {
      window.removeEventListener("resize", recalculateBaseHeight);
    };
  }, []);

  React.useEffect(() => {
    setCurrentMaxIndex(Math.max(0, props.notifications.length - 1));
  }, [props.notifications]);

  React.useEffect(() => {
    setShowCounter(currentMaxIndex > maxIndexAllowed);
  }, [currentMaxIndex, maxIndexAllowed]);

  const indicatorTopRems = (maxIndexAllowed + 1) * paddedNotificationHeight;

  return (
    <StyledDiv ref={baseRef}>
      <TransitionGroup style={{ height: "100%", position: "relative" }}>
        {props.notifications.map((notification, index) => (
          <Transition
            key={notification.id}
            in
            timeout={1_000}
            mountOnEnter
            unmountOnExit
          >
            {(transitionStatus) => (
              <NotificationToast
                index={Math.min(index, maxIndexAllowed)}
                notification={notification}
                transitionStatus={transitionStatus}
                onDismissNotification={props.onDismissNotification}
              />
            )}
          </Transition>
        ))}

        {showCounter && (
          <Transition key={currentMaxIndex} timeout={300}>
            {(transitionStatus) => (
              <StyledCountIndicator
                style={{
                  top: `${indicatorTopRems}rem`,
                  opacity: transitionStatus === "exiting" ? 0 : 1,
                }}
              >
                +{currentMaxIndex - maxIndexAllowed} notifications not shown
              </StyledCountIndicator>
            )}
          </Transition>
        )}
      </TransitionGroup>
    </StyledDiv>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  notifications: notificationsSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissNotification: dismissNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationsDisplayComponent);

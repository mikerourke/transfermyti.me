import React from "react";
import { connect } from "react-redux";
import { TransitionGroup, Transition } from "react-transition-group";
import { TransitionStatus } from "react-transition-group/Transition";

import { styled, useTheme } from "~/components";
import NotificationToast from "~/layout/NotificationToast";
import { dismissNotification } from "~/modules/app/appActions";
import { notificationsSelector } from "~/modules/app/appSelectors";
import { NotificationModel, ReduxState } from "~/typeDefs";

const Base = styled.div({
  position: "absolute",
  right: 0,
  top: "4rem",
  bottom: "6rem",
  width: 0,
});

const CountIndicator = styled.div<{ transitionStatus: TransitionStatus }>(
  {
    position: "absolute",
    left: 0,
    right: 0,
    transition: "opacity 300ms ease-in",
    zIndex: 4,
  },
  ({ theme, transitionStatus }) => ({
    background: theme.colors.secondary,
    color: theme.colors.midnight,
    fontWeight: theme.fontWeights.bold,
    opacity: transitionStatus === "exiting" ? 0 : 1,
  }),
);

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
    <Base ref={baseRef}>
      <TransitionGroup css={{ height: "100%", position: "relative" }}>
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
              <CountIndicator
                css={{ top: `${indicatorTopRems}rem` }}
                transitionStatus={transitionStatus}
              >
                +{currentMaxIndex - maxIndexAllowed} notifications not shown
              </CountIndicator>
            )}
          </Transition>
        )}
      </TransitionGroup>
    </Base>
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

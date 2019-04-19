import { createSelector } from 'reselect';
import { get, isEmpty, isNil } from 'lodash';
import {
  CompoundWorkspaceModel,
  EntityGroup,
  InTransferDetailsByGroupModel,
  InTransferDetailsModel,
  NotificationModel,
  ReduxState,
} from '~/types';

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): Array<NotificationModel> => notifications,
);

export const selectCurrentTransferType = (state: ReduxState) =>
  state.app.currentTransferType;

const selectInTransferWorkspace = createSelector(
  (state: ReduxState) => state.app.inTransferWorkspace,
  (inTransferWorkspace): Partial<CompoundWorkspaceModel> => {
    if (isNil(inTransferWorkspace)) return {};

    return inTransferWorkspace;
  },
);

export const selectInTransferWorkspaceName = createSelector(
  selectInTransferWorkspace,
  (inTransferWorkspace): string => {
    if (isEmpty(inTransferWorkspace)) return 'None';

    return inTransferWorkspace.name;
  },
);

export const selectInTransferDetailsByGroup = createSelector(
  selectInTransferWorkspace,
  (state: ReduxState) => state.app.inTransferDetailsByGroupByWorkspace,
  (
    inTransferWorkspace,
    inTransferDetailsByGroupByWorkspace,
  ): InTransferDetailsByGroupModel => {
    const emptyInTransferDetails: InTransferDetailsModel = {
      countTotal: 0,
      countCurrent: 0,
      entityGroup: null,
      entityRecord: null,
      workspaceId: null,
    };

    const emptyDetailsByEntityGroup = [
      EntityGroup.Projects,
      EntityGroup.Tags,
      EntityGroup.Clients,
      EntityGroup.Tasks,
      EntityGroup.TimeEntries,
    ].reduce(
      (acc, entityGroup) => ({
        ...acc,
        [entityGroup]: {
          ...emptyInTransferDetails,
          entityGroup,
        },
      }),
      {},
    );

    if (
      isNil(inTransferDetailsByGroupByWorkspace) ||
      isEmpty(inTransferWorkspace)
    ) {
      // @ts-ignore
      return emptyDetailsByEntityGroup;
    }

    // @ts-ignore
    return get(
      inTransferDetailsByGroupByWorkspace,
      inTransferWorkspace.id,
      emptyDetailsByEntityGroup,
    );
  },
);

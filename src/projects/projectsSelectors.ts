import { createSelector, Selector } from "reselect";
import { get } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/utils";
import { selectTogglClientMatchingId } from "~/clients/clientsSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import {
  ClockifyProjectRequestModel,
  CompoundProjectModel,
} from "./projectsTypes";

export const selectClockifyProjectIds = createSelector(
  (state: ReduxState) => state.projects.clockify.idValues,
  (projectIds): Array<string> => projectIds,
);

export const selectTogglProjectsById = createSelector(
  (state: ReduxState) => state.projects.toggl.byId,
  projectsById => projectsById,
);

export const selectTogglProjectsByWorkspaceFactory = (
  inclusionsOnly: boolean,
): Selector<ReduxState, Record<string, Array<CompoundProjectModel>>> =>
  createSelector(
    selectTogglProjectsById,
    (projectsById): Record<string, Array<CompoundProjectModel>> => {
      const projects = Object.values(projectsById);

      const projectsToUse = inclusionsOnly
        ? findTogglInclusions(projects)
        : projects;

      return groupByWorkspace(projectsToUse);
    },
  );

export const selectProjectsTransferPayloadForWorkspace = createSelector(
  selectTogglProjectsByWorkspaceFactory(true),
  selectTogglClientMatchingId,
  (inclusionsByWorkspace, getClientMatchingId) => (
    workspaceIdToGet: string,
  ): Array<ClockifyProjectRequestModel> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundProjectModel>;
    if (inclusions.length === 0) {
      return [];
    }

    return inclusions.reduce((acc, project) => {
      const matchingClient = getClientMatchingId(project.clientId);
      const clientId = matchingClient.isIncluded
        ? matchingClient.linkedId
        : null;

      return [
        ...acc,
        {
          name: project.name,
          clientId,
          isPublic: project.isPublic,
          estimate: {
            estimate: 0,
            type: "AUTO",
          },
          color: project.color,
          billable: project.isBillable,
        },
      ];
    }, []);
  },
);

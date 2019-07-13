import { createSelector } from "reselect";
import { get } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/redux/utils";
import { selectTogglClientMatchingId } from "~/redux/entities/clients/clientsSelectors";
import {
  ClockifyProjectRequestModel,
  CompoundProjectModel,
  ReduxState,
} from "~/types";

export const selectClockifyProjectIds = createSelector(
  (state: ReduxState) => state.entities.projects.clockify.idValues,
  (projectIds): Array<string> => projectIds,
);

export const selectTogglProjectsById = createSelector(
  (state: ReduxState) => state.entities.projects.toggl.byId,
  projectsById => projectsById,
);

export const selectTogglProjectsByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
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
    if (inclusions.length === 0) return [];

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
            estimate: "",
            type: "AUTO",
          },
          color: project.color,
          billable: project.isBillable,
        },
      ];
    }, []);
  },
);

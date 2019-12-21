import {
  BaseCompoundEntityModel,
  CompoundEntityModel,
  EntityGroup,
} from "~/common/commonTypes";
import { ClockifyMembershipModel } from "~/users/usersTypes";

interface ClockifyWorkspaceSettingsModel {
  timeRoundingInReports: boolean;
  onlyAdminsSeeBillableRates: boolean;
  onlyAdminsCreateProject: boolean;
  onlyAdminsSeeDashboard: boolean;
  defaultBillableProjects: boolean;
  lockTimeEntries: string | null;
  round: {
    round: string;
    minutes: string;
  };
  projectFavorites: boolean;
  canSeeTimeSheet: boolean;
  projectPickerSpecialFilter: boolean;
  forceProjects: boolean;
  forceTasks: boolean;
  forceTags: boolean;
  forceDescription: boolean;
  onlyAdminsSeeAllTimeEntries: boolean;
  onlyAdminsSeePublicProjectsEntries: boolean;
  trackTimeDownToSecond: boolean;
  projectGroupingLabel: string;
}

export interface ClockifyWorkspaceModel {
  id: string;
  name: string;
  hourlyRate: {
    amount: number;
    currency: string;
  };
  memberships: ClockifyMembershipModel[];
  workspaceSettings: ClockifyWorkspaceSettingsModel;
  imageUrl: string;
}

export interface TogglWorkspaceModel {
  id: number;
  name: string;
  profile: number;
  premium: boolean;
  admin: boolean;
  default_hourly_rate: number;
  default_currency: string;
  only_admins_may_create_projects: boolean;
  only_admins_see_billable_rates: boolean;
  only_admins_see_team_dashboard: boolean;
  projects_billable_by_default: boolean;
  rounding: number;
  rounding_minutes: number;
  api_token: string;
  at: string;
  ical_enabled: boolean;
}

export interface CompoundWorkspaceModel extends BaseCompoundEntityModel {
  id: string;
  name: string;
  inclusionsByYear?: Record<string, boolean>;
  userIds?: string[];
  isAdmin: boolean | null;
}

export type EntitiesByGroupByWorkspaceModel = Record<
  string,
  Record<EntityGroup, CompoundEntityModel[]>
>;

export interface RecordCountsModel {
  includedRecordCount: number;
  totalRecordCount: number;
  includedEntryCount: number;
  totalEntryCount: number;
}

export type CountsByGroupByWorkspaceModel = Record<
  string,
  Record<EntityGroup, RecordCountsModel>
>;

export interface UpdateIncludedWorkspaceYearModel {
  workspaceId: string;
  year: number;
  isIncluded: boolean;
}

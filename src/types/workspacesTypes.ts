import { CompoundEntityModel, TogglTotalCurrencyModel } from './commonTypes';
import { ClockifyMembershipModel } from './usersTypes';
import { EntityGroup, BaseCompoundEntityModel } from '~/types/entityTypes';

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
  memberships: Array<ClockifyMembershipModel>;
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

interface TogglSummaryReportDataItemModel {
  title: {
    time_entry: string;
  };
  time: number;
  cur: string | null;
  sum: number | null;
  rate: number | null;
}

export interface TogglSummaryReportDataModel {
  id: number;
  title: {
    project: string;
    client: string;
    color: string;
    hex_color: string;
  };
  time: number;
  total_currencies: Array<TogglTotalCurrencyModel>;
  items: Array<TogglSummaryReportDataItemModel>;
}

export interface TogglSummaryReportModel {
  total_grand: number;
  total_billable: number | null;
  total_currencies: Array<TogglTotalCurrencyModel>;
  data: Array<TogglSummaryReportDataModel>;
}

export interface CompoundWorkspaceModel extends BaseCompoundEntityModel {
  id: string;
  name: string;
  inclusionsByYear?: Record<string, boolean>;
  userIds?: Array<string>;
  isAdmin: boolean | null;
}

export type EntitiesByGroupByWorkspaceModel = Record<
  string,
  Record<EntityGroup, Array<CompoundEntityModel>>
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

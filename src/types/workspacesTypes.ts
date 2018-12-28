import { ClockifyMembership } from './userTypes';

interface ClockifyWorkspaceSettings {
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

export interface ClockifyWorkspace {
  id: string;
  name: string;
  hourlyRate: {
    amount: number;
    currency: string;
  };
  memberships: ClockifyMembership[];
  workspaceSettings: ClockifyWorkspaceSettings;
  imageUrl: string;
}

export interface TogglWorkspace {
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

interface TogglTotalCurrencyModel {
  currency: string | null;
  amount: number | null;
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

interface TogglSummaryReportDataModel {
  id: number;
  title: {
    project: string;
    client: string;
    color: string;
    hex_color: string;
  };
  time: number;
  total_currencies: TogglTotalCurrencyModel[];
  items: TogglSummaryReportDataItemModel[];
}

export interface TogglSummaryReport {
  total_grand: number;
  total_billable: number | null;
  total_currencies: TogglTotalCurrencyModel[];
  data: TogglSummaryReportDataModel[];
}

export interface WorkspaceModel {
  id: string;
  name: string;
  isAdmin: boolean | null;
  isIncluded: boolean | null;
  inclusionsByYear?: Record<string, boolean>;
}

export interface WorkspaceAndYearModel {
  id: string;
  year: number;
}

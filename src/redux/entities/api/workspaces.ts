import { ClockifyApiMembership } from './user';

interface ClockifyApiWorkspaceSettings {
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

export interface ClockifyApiWorkspace {
  id: string;
  name: string;
  hourlyRate: {
    amount: number;
    currency: string;
  };
  memberships: ClockifyApiMembership[];
  workspaceSettings: ClockifyApiWorkspaceSettings;
  imageUrl: string;
}

export interface TogglApiWorkspace {
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

export const apiFetchClockifyWorkspaces = (): Promise<ClockifyApiWorkspace[]> =>
  fetch('/clockify/api/workspaces/');

export const apiFetchTogglWorkspaces = (): Promise<TogglApiWorkspace[]> =>
  fetch('/toggl/api/workspaces');

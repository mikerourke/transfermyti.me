export interface ClockifyApiMembership {
  userId: string;
  hourlyRate: number | null;
  membershipType: string;
  membershipStatus: string;
  target: string;
}

export interface ClockifyApiUser {
  id: string;
  email: string;
  name: string;
  memberships: ClockifyApiMembership[];
  profilePicture: string;
  activeWorkspace: string;
  defaultWorkspace: string;
  settings: {
    weekStart: string;
    timeZone: string;
    timeFormat: string;
    dateFormat: string;
    sendNewsletter: boolean;
    weeklyUpdates: boolean;
    longRunning: boolean;
    summaryReportSettings: {
      group: string;
      subgroup: string;
    };
    isCompactViewOn: boolean;
    dashboardSelection: string;
    timeTrackingManual: boolean;
  };
  status: string;
}

export interface TogglApiUser {
  id: number;
  default_wid: number;
  email: string;
  fullname: string;
  at: string;
  created_at: string;
  timezone: string;
  workspaces: any[]; // TODO: Change to workspace
}

export const apiFetchClockifyUserDetails = (
  userId: string,
): Promise<ClockifyApiUser> => fetch(`/clockify/api/users/${userId}`);

export const apiFetchTogglUserDetails = (): Promise<{
  since: number;
  data: TogglApiUser;
}> => fetch('/toggl/api/me');

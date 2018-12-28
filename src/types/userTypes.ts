import { TogglWorkspace } from './workspacesTypes';

export interface ClockifyMembership {
  userId: string;
  hourlyRate: number | null;
  membershipType: string;
  membershipStatus: string;
  target: string;
}

export interface ClockifyUser {
  id: string;
  email: string;
  name: string;
  memberships: ClockifyMembership[];
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

export interface TogglUser {
  id: number;
  default_wid: number;
  email: string;
  fullname: string;
  at: string;
  created_at: string;
  timezone: string;
  workspaces: TogglWorkspace[];
}

export interface TogglMeResponse {
  since: number;
  data: TogglUser;
}

export interface UserModel {
  userId: string | null;
  email: string | null;
}

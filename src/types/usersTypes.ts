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
  jquery_timeofday_format: string;
  jquery_date_format: string;
  timeofday_format: string;
  date_format: string;
  store_start_and_stop_time: boolean;
  beginning_of_week: number;
  language: string;
  image_url: string;
  sidebar_piechart: false;
  at: string;
  retention: number;
  record_timeline: boolean;
  render_timeline: boolean;
  timeline_enabled: boolean;
  timeline_experiment: boolean;
  new_blog_post: any;
  should_upgrade: boolean;
  invitation: any;
}

export interface TogglMeResponse {
  since: number;
  data: {
    id: number;
    default_wid: number;
    email: string;
    fullname: string;
    at: string;
    created_at: string;
    timezone: string;
    workspaces: TogglWorkspace[];
  };
}

export interface UserModel {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean | null;
  isActive: boolean;
  linkedId: string | null;
  isIncluded: boolean;
}

export interface AddUsersToWorkspaceRequest {
  emails: string[];
}

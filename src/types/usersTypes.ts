import { TogglWorkspaceModel } from './workspacesTypes';
import { BaseCompoundEntityModel } from '~/types/entityTypes';

// TODO: Add the other options here.
export enum ClockifyUserStatus {
  Active = 'ACTIVE',
}

export interface ClockifyMembershipModel {
  userId: string;
  hourlyRate: number | null;
  membershipType: string;
  membershipStatus: string;
  target: string;
}

export interface ClockifyUserModel {
  id: string;
  email: string;
  name: string;
  memberships: Array<ClockifyMembershipModel>;
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

export interface TogglUserModel {
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
  userGroupIds?: Array<string>;
}

export interface TogglWorkspaceUserModel {
  id: number;
  uid: number;
  wid: number;
  admin: boolean;
  owner: boolean;
  active: boolean;
  email: string;
  timezone: string;
  inactive: boolean;
  at: string;
  name: string;
  group_ids: Array<number> | null;
  rate: string | null;
  labour_cost: string | null;
  invite_url: string | null;
  invitation_code: string | null;
  avatar_file_name: string | null;
}

export interface TogglMeResponseModel {
  since: number;
  data: {
    id: number;
    default_wid: number;
    email: string;
    fullname: string;
    at: string;
    created_at: string;
    timezone: string;
    workspaces: Array<TogglWorkspaceModel>;
  };
}

export interface CompoundUserModel extends BaseCompoundEntityModel {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean | null;
  isActive: boolean;
  userGroupIds: Array<string> | null;
}

export interface AddUsersToWorkspaceRequestModel {
  emails: Array<string>;
}

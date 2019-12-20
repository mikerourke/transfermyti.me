import { BaseCompoundEntityModel } from "~/commonTypes";
import { TogglWorkspaceModel } from "~/workspaces/workspacesTypes";

export interface ClockifyHourlyRateModel {
  amount: number;
  currency: string;
}

export interface ClockifyMembershipModel {
  hourlyRate: ClockifyHourlyRateModel;
  membershipStatus: string;
  membershipType: string;
  targetId: string;
  userId: string;
}

type WeekStart =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ClockifyUserModel {
  activeWorkspace: string;
  defaultWorkspace: string;
  email: string;
  id: string;
  memberships: Array<ClockifyMembershipModel>;
  name: string;
  profilePicture: string;
  settings: {
    collapseAllProjectLists: boolean;
    dashboardPinToTop: boolean;
    dashboardSelection: "ME" | "TEAM";
    dashboardViewType: "PROJECT" | "BILLABILITY";
    dateFormat: string;
    isCompactViewOn: boolean;
    longRunning: boolean;
    projectListCollapse: number;
    sendNewsletter: boolean;
    summaryReportSettings: {
      group: string;
      subgroup: string;
    };
    timeFormat: string;
    timeTrackingManual: boolean;
    timeZone: string;
    weekStart: WeekStart;
    weeklyUpdates: boolean;
  };
  status: "ACTIVE" | "PENDING_EMAIL_VERIFICATION" | "DELETED";
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
  new_blog_post: unknown;
  should_upgrade: boolean;
  invitation: unknown;
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

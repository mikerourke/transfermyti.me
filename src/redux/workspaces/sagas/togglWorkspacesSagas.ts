import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray } from "~/api/apiRequests";
import { EntityGroup, type Workspace } from "~/types";

type TogglWorkspaceSubscription = {
  auto_renew: boolean;
  card_details: AnyValid;
  company_id: number;
  contact_detail: AnyValid;
  created_at: string;
  currency: string;
  customer_id: number;
  deleted_at: string;
  last_pricing_plan_id: number;
  organization_id: number;
  payment_details: string;
  pricing_plan_id: number;
  renewal_at: string;
  subscription_id: number;
  subscription_period: string;
  workspace_id: number;
};

type TogglCsvUpload = {
  at: string;
  log_id: string;
};

type TogglTimeEntryConstraints = {
  description_present: boolean;
  project_present: boolean;
  tag_present: boolean;
  task_present: boolean;
  time_entry_constraints_enabled: boolean;
};

/**
 * Response from Toggl API for workspace.
 * @see https://developers.track.toggl.com/docs/api/workspaces#response-4
 */
export type TogglWorkspaceResponse = {
  admin: boolean;
  api_token: string;
  at: string;
  business_ws: boolean;
  csv_upload: TogglCsvUpload | null;
  default_currency: string;
  default_hourly_rate: number | null;
  ical_enabled: boolean;
  ical_url: string;
  id: number;
  last_modified: string;
  logo_url: string;
  max_data_retention_days: number;
  name: string;
  only_admins_may_create_projects: boolean;
  only_admins_may_create_tags: boolean;
  only_admins_see_billable_rates: boolean;
  only_admins_see_team_dashboard: boolean;
  organization_id: number;
  permissions: string[];
  premium: boolean;
  profile: number;
  projects_billable_by_default: boolean;
  rate_last_updated: string | null;
  reports_collapse: boolean;
  role: string;
  rounding: number;
  rounding_minutes: number;
  server_deleted_at: string | null;
  subscription: TogglWorkspaceSubscription | null;
  suspended_at: string | null;
  te_constraints: TogglTimeEntryConstraints;
  working_hours_in_minutes: number | null;
};

/**
 * Fetches all workspaces from Toggl and returns array of transformed
 * workspaces.
 */
export function* fetchTogglWorkspacesSaga(): SagaIterator {
  const togglWorkspaces: TogglWorkspaceResponse[] = yield call(
    fetchArray,
    "/toggl/api/me/workspaces",
  );

  return togglWorkspaces.map(transformFromResponse);
}

function transformFromResponse(workspace: TogglWorkspaceResponse): Workspace {
  return {
    id: workspace.id.toString(),
    name: workspace.name,
    userIds: [],
    isAdmin: true,
    isPaid: workspace.premium,
    workspaceId: workspace.id.toString(),
    entryCount: 0,
    linkedId: null,
    isIncluded: false,
    memberOf: EntityGroup.Workspaces,
  };
}

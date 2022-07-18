import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray } from "~/entityOperations/apiRequests";
import { EntityGroup, type Workspace } from "~/typeDefs";

interface TogglWorkspaceSubscription {
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
}

interface TogglCsvUpload {
  at: string;
  log_id: string;
}

export interface TogglWorkspaceResponse {
  id: number;
  organization_id: number;
  name: string;
  profile: number;
  premium: boolean;
  business_ws: boolean;
  admin: boolean;
  suspended_at: string | null;
  server_deleted_at: string | null;
  default_hourly_rate: number | null;
  rate_last_updated: string | null;
  default_currency: string;
  only_admins_may_create_projects: boolean;
  only_admins_may_create_tags: boolean;
  only_admins_see_billable_rates: boolean;
  only_admins_see_team_dashboard: boolean;
  projects_billable_by_default: boolean;
  reports_collapse: boolean;
  rounding: number;
  rounding_minutes: number;
  api_token: string;
  at: string;
  logo_url: string;
  ical_url: string;
  ical_enabled: boolean;
  csv_upload: TogglCsvUpload | null;
  subscription: TogglWorkspaceSubscription | null;
}

/**
 * Fetches all workspaces from Toggl and returns array of transformed
 * workspaces.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-workspaces
 */
export function* fetchTogglWorkspacesSaga(): SagaIterator {
  const togglWorkspaces: TogglWorkspaceResponse[] = yield call(
    fetchArray,
    "/toggl/api/workspaces",
  );

  return togglWorkspaces.map(transformFromResponse);
}

function transformFromResponse(workspace: TogglWorkspaceResponse): Workspace {
  return {
    id: workspace.id.toString(),
    name: workspace.name,
    userIds: [],
    isAdmin: true,
    workspaceId: workspace.id.toString(),
    entryCount: 0,
    linkedId: null,
    isIncluded: false,
    memberOf: EntityGroup.Workspaces,
  };
}

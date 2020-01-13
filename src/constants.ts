// @ts-ignore
const API_PORT = process.env.LOCAL_API_PORT;
export const LOCAL_API_URL = `http://localhost:${API_PORT}/api`;

export const IS_USING_LOCAL_API =
  // @ts-ignore
  process.env.USE_LOCAL_API === "true" || process.env.NODE_ENV === "test";

export const STORAGE_KEY = "transfermytime";

export const CLOCKIFY_API_URL = "https://api.clockify.me/api";
export const CLOCKIFY_API_PAGE_SIZE = 100;
// Delay time for requests to ensure rate limits are not exceeded:
export const CLOCKIFY_API_DELAY = IS_USING_LOCAL_API ? 0 : 1_000 / 4;

export const TOGGL_API_URL = "https://www.toggl.com/api/v8";
export const TOGGL_REPORTS_URL = "https://toggl.com/reports/api/v2";
// Delay time for requests to ensure rate limits are not exceeded:
export const TOGGL_API_DELAY = IS_USING_LOCAL_API ? 0 : 1_000 / 4;

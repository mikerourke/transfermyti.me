import { ClockifyUser, TogglMeResponse } from '../../../types/userTypes';

export const apiFetchClockifyUserDetails = (
  userId: string,
): Promise<ClockifyUser> => fetch(`/clockify/api/users/${userId}`);

export const apiFetchTogglUserDetails = (): Promise<TogglMeResponse> =>
  fetch('/toggl/api/me');

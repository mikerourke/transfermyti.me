export enum CredentialsField {
  TogglEmail = 'togglEmail',
  TogglUserId = 'togglUserId',
  TogglApiKey = 'togglApiKey',
  ClockifyUserId = 'clockifyUserId',
  ClockifyApiKey = 'clockifyApiKey',
}

export type CredentialsModel = Partial<Record<CredentialsField, string>>;

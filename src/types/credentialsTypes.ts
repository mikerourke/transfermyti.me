export enum CredentialsField {
  TogglEmail = 'togglEmail',
  TogglApiKey = 'togglApiKey',
  ClockifyUserId = 'clockifyUserId',
  ClockifyApiKey = 'clockifyApiKey',
}

export type CredentialsModel = Partial<Record<CredentialsField, string>>;

export enum CredentialsField {
  TogglEmail = 'togglEmail',
  TogglApiKey = 'togglApiKey',
  ClockifyApiKey = 'clockifyApiKey',
}

export type CredentialsModel = Partial<Record<CredentialsField, string>>;

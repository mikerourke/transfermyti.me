import type { CredentialsByMapping } from "~/typeDefs";

const STORAGE_KEY = "transfermytime";

const DEFAULT_CREDENTIALS = {
  source: {
    apiKey: null,
    email: null,
    userId: null,
  },
  target: {
    apiKey: null,
    email: null,
    userId: null,
  },
};

export function getCredentialsFromStorage(): CredentialsByMapping | null {
  const contents = localStorage.getItem(STORAGE_KEY);

  if (contents !== null) {
    return JSON.parse(contents);
  }

  return null;
}

export function mergeCredentialsInStorage(
  credentials: CredentialsByMapping,
): void {
  let existingCredentials = getCredentialsFromStorage();
  if (existingCredentials === null) {
    existingCredentials = { ...DEFAULT_CREDENTIALS };
  }

  const mergedCredentials = {
    ...existingCredentials,
    ...credentials,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedCredentials));
}

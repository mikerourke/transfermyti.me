import storage from 'store';
import { initialState } from '../redux/credentials/credentialsReducer';
import { CredentialsModel } from '../types/credentialsTypes';

const STORAGE_KEY = 'togglToClockify';

const defaultStorage = initialState;

export function getStorage() {
  const contents = storage.get(STORAGE_KEY);
  return contents || defaultStorage;
}

export function updateStorage(credentials: CredentialsModel) {
  const currentContents = getStorage();
  storage.set(STORAGE_KEY, { ...currentContents, ...credentials });
}

export function hasStorage() {
  const currentContents = storage.get(STORAGE_KEY);
  if (!currentContents) return false;
  const contentValues = Object.values(currentContents).filter(
    (value: string) => value.length > 0,
  );
  return contentValues.length > 0;
}

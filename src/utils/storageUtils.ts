import storage from 'store';
import { initialState } from '../redux/credentials/credentialsReducer';
import { CredentialsModel } from '../types/credentialsTypes';

const STORAGE_KEY = 'togglToClockify';

// TODO: Disable this for production!

const defaultStorage = initialState;

export function getStorage() {
  const contents = storage.get(STORAGE_KEY);
  return contents || defaultStorage;
}

export function updateStorage(credentials: CredentialsModel) {
  const currentContents = getStorage();
  storage.set(STORAGE_KEY, { ...currentContents, ...credentials });
}

import { isNil } from 'lodash';

export async function fetchArray(endpoint: string, fetchOptions: any = {}) {
  const response = await fetch(endpoint, fetchOptions);
  return isNil(response) ? [] : response;
}

export async function fetchObject(endpoint: string, fetchOptions: any = {}) {
  const response = await fetch(endpoint, fetchOptions);
  return isNil(response) ? {} : response;
}

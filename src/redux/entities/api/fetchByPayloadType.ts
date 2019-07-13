import { isNil } from "lodash";

/**
 * Ensures a valid array is returned from a fetch call.
 */
export async function fetchArray(endpoint: string, fetchOptions: any = {}) {
  const response = await fetch(endpoint, fetchOptions);
  return isNil(response) ? [] : response;
}

/**
 * Ensures a valid object is returned from a fetch call.
 */
export async function fetchObject(endpoint: string, fetchOptions: any = {}) {
  const response = await fetch(endpoint, fetchOptions);
  return isNil(response) ? {} : response;
}

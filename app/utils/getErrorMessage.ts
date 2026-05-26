import { FetchError } from 'ofetch';

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof FetchError)) return fallback;
  return error.data?.message || fallback;
};

export type AdapterResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export const adapters = {};

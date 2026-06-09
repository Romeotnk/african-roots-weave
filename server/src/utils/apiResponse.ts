export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const apiResponse = <T>(
  success: boolean,
  data: T | null,
  message: string,
  pagination?: PaginationMeta,
) => ({
  success,
  data,
  message,
  ...(pagination ? { pagination } : {}),
});

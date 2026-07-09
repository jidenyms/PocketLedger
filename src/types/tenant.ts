/** Passed into every tenant-scoped service — never trust client-supplied user id. */
export type TenantContext = {
  userId: string;
};

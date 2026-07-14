export function useAdminList() {
  return {
    data: [] as Array<{ id: string; name: string; username?: string }>,
    admins: [] as Array<{ id: string; name: string; username?: string }>,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}


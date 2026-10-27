/**
 * @deprecated This hook is no longer used.
 * Data fetching has been fully migrated to TanStack React Query.
 * Each admin page fetches its own data via hooks in src/hooks/queries/.
 *
 * This file is kept to avoid breaking any lingering imports during the transition.
 */
export function useInitAdminData() {
  return { loading: false, error: null };
}

import { useEffect, useState } from "react";

// Tracks the current page number, resetting back to page 1 whenever any of
// the given reset keys change (e.g. a search term) — otherwise a new filter
// could leave the user stranded on a page number that no longer has results.
export function usePagination(resetKeys: unknown[] = []) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetKeys);

  return { page, setPage };
}

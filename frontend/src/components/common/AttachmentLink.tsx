import { useState, type ReactNode } from "react";

import type { SignedDownload } from "../../services/assignmentService";
import { toast } from "../../store/useToastStore";

interface AttachmentLinkProps {
  /** Asks the API for a fresh signed link. Called on each click. */
  getDownload: () => Promise<SignedDownload>;
  className?: string;
  children: ReactNode;
}

/**
 * Downloads a file stored in the private bucket.
 *
 * There is no permanent URL to put in an href: the API checks the user may
 * see the file and returns a link that expires within a minute. So this is a
 * button that fetches the link when clicked.
 *
 * The signed link is issued with a download filename, so storage responds
 * with `Content-Disposition: attachment`. Following such a link starts a
 * download without navigating away from the page, which is why this doesn't
 * open a new tab: a tab opened for a download is left behind empty, and one
 * opened after an await is blocked as a popup anyway.
 */
export default function AttachmentLink({ getDownload, className, children }: AttachmentLinkProps) {
  const [opening, setOpening] = useState(false);

  async function handleClick() {
    setOpening(true);

    try {
      const { url } = await getDownload();

      const link = document.createElement("a");
      link.href = url;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Unable to download that file. You may no longer have access to it.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={opening}
      aria-busy={opening}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-60`}
    >
      {children}
    </button>
  );
}

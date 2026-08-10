import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}

function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        )}

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

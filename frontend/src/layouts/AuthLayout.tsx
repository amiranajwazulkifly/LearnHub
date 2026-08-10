import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-100 px-4 py-12 dark:bg-gray-950">
      {/* technical dot-grid backdrop */}
      <div aria-hidden="true" className="bg-dot-grid pointer-events-none absolute inset-0" />

      {/* faint, slow-drifting brand glow — restrained, not neon */}
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl dark:bg-brand-600/15"
      />
      <div
        aria-hidden="true"
        className="animate-drift-reverse pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
            learnhub / sign-in
          </p>

          <div className="mb-2 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-600/30 bg-brand-50 font-mono text-sm font-bold text-brand-700 dark:border-brand-400/30 dark:bg-brand-950/40 dark:text-brand-300">
              L
            </span>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              LearnHub
            </h1>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Course Management System
          </p>
        </div>

        <section className="relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;

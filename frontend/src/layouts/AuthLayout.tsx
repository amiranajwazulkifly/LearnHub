import { Outlet } from 'react-router-dom';

import {
  AnnouncementsIcon,
  AssignmentsIcon,
  MyCoursesIcon,
} from '../components/common/NavIcons';

const FEATURES = [
  { icon: <MyCoursesIcon />, label: 'Manage courses end-to-end' },
  { icon: <AssignmentsIcon />, label: 'Assign, submit and grade work' },
  { icon: <AnnouncementsIcon />, label: 'Keep everyone in the loop' },
];

function CornerBracket({ className }: { className: string }) {
  return <span aria-hidden="true" className={`pointer-events-none absolute h-5 w-5 border-brand-400/70 ${className}`} />;
}

function AuthLayout() {
  return (
    // `dark` is forced here (not tied to the site-wide theme toggle) — the
    // auth gate is deliberately always presented as a dark HUD/terminal,
    // which also means every existing `dark:` class already written into
    // LoginForm/RegisterForm/etc. (see useThemeStore's `.dark *` scoping)
    // just activates for free without touching those files.
    <main className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 py-12 text-gray-100">
      <div aria-hidden="true" className="bg-line-grid pointer-events-none absolute inset-0 opacity-60" />

      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-reverse pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl"
      />

      {/* Gradient-border wrapper: a 1px ring of brand color around the card,
          faked with a padded gradient background behind a solid inner panel. */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-linear-to-br from-brand-500/70 via-brand-700/50 to-brand-400/70 p-px shadow-[0_0_90px_-20px_var(--color-brand-600)]">
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gray-950 md:flex-row">
          {/* HUD scan line sweeping down across the whole card */}
          <div
            aria-hidden="true"
            className="animate-scan-sweep pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-brand-300/80 to-transparent"
          />

          <CornerBracket className="left-0 top-0 border-l-2 border-t-2" />
          <CornerBracket className="right-0 top-0 border-r-2 border-t-2" />
          <CornerBracket className="bottom-0 left-0 border-b-2 border-l-2" />
          <CornerBracket className="bottom-0 right-0 border-b-2 border-r-2" />

          {/* Brand panel — desktop: left. Mobile: stacked below the form. */}
          <div className="relative order-2 flex flex-col justify-center gap-8 overflow-hidden border-t border-white/10 bg-linear-to-br from-brand-900 via-brand-700 to-brand-600 p-8 text-white sm:p-10 md:order-1 md:w-[42%] md:border-t-0 md:p-12">
            <div
              aria-hidden="true"
              className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
            />

            <div className="relative">
              <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-brand-200/80">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-300" />
                </span>
                system.auth // secure-link
              </div>

              <div className="mb-2">
                <img src="/logo-dark.png" alt="LearnHub" className="h-9 w-auto" />
              </div>

              <p className="text-sm text-white/70">Course Management System</p>
            </div>

            <ul className="relative hidden flex-col gap-4 sm:flex">
              {FEATURES.map((feature) => (
                <li key={feature.label} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-brand-300/30 bg-white/5">
                    {feature.icon}
                  </span>
                  {feature.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Divider — a thin glowing line with a single traveling pulse,
              standing in for a circuit trace between the two panels.
              Desktop only; the panels just stack directly on mobile. */}
          <div className="relative hidden w-px shrink-0 md:block">
            <div className="absolute inset-y-6 left-0 w-px bg-linear-to-b from-transparent via-brand-400/80 to-transparent shadow-[0_0_10px_1px_var(--color-brand-400)]" />
            <span className="animate-divider-pulse absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-300 shadow-[0_0_8px_2px_var(--color-brand-400)]" />
          </div>

          {/* Form panel — desktop: right. Mobile: stacked above the brand panel. */}
          <section className="relative order-1 flex-1 bg-gray-950/60 p-6 backdrop-blur-xl sm:p-10 md:order-2 md:p-12">
            <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-brand-300/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_var(--color-emerald-400)]" />
              secure channel established
            </div>

            <Outlet />
          </section>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;

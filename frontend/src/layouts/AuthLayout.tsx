import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">
            LearnHub
          </h1>

          <p className="mt-1 text-gray-600">
            Course Management System
          </p>
        </div>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;

import { useAuthStore } from '../../store/useAuthStore';

function ProfilePage() {
  const user = useAuthStore(
    (state) => state.user
  );

  if (!user) {
    return null;
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">
        Student Profile
      </h1>

      <dl className="mt-5 space-y-3">
        <div>
          <dt className="font-medium">Name</dt>
          <dd>{user.fullName}</dd>
        </div>

        <div>
          <dt className="font-medium">Email</dt>
          <dd>{user.email}</dd>
        </div>

        <div>
          <dt className="font-medium">Role</dt>
          <dd>{user.role}</dd>
        </div>

        <div>
          <dt className="font-medium">Status</dt>
          <dd>{user.status}</dd>
        </div>
      </dl>
    </section>
  );
}

export default ProfilePage;

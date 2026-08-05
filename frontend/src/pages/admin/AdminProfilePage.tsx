import ProfileForm from '../../components/forms/ProfileForm';

function AdminProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Admin Profile
        </h1>

        <p className="mt-1 text-gray-600">
          Manage your administrator account.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}

export default AdminProfilePage;

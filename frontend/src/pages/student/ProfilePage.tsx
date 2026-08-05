import ProfileForm from '../../components/forms/ProfileForm';

function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Student Profile
        </h1>

        <p className="mt-1 text-gray-600">
          Manage your LearnHub account.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}

export default ProfilePage;

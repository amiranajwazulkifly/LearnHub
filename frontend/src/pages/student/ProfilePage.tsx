import ProfileForm from '../../components/forms/ProfileForm';
import PageHeader from '../../components/layout/PageHeader';

function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Student Profile"
        description="Manage your LearnHub account information and password."
      />

      <ProfileForm />
    </div>
  );
}

export default ProfilePage;

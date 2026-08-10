import PageHeader from '../../components/layout/PageHeader';
import ProfileForm from '../../components/forms/ProfileForm';

function AdminProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="admin / profile"
        title="Admin Profile"
        description="Manage your administrator account information and password."
      />

      <ProfileForm />
    </div>
  );
}

export default AdminProfilePage;

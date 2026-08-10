import ProfileForm from '../../components/forms/ProfileForm';
import PageHeader from '../../components/layout/PageHeader';

function InstructorProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="instructor / profile"
        title="Instructor Profile"
        description="Manage your LearnHub account information and password."
      />

      <ProfileForm />
    </div>
  );
}

export default InstructorProfilePage;

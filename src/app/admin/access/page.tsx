import { CredentialSignInForm } from "@/components/auth/CredentialSignInForm";

export default function AdminAccessPage() {
  return (
    <CredentialSignInForm
      mode="admin"
      title="Admin Access"
      subtitle="Protected site control panel"
      defaultCallback="/admin"
    />
  );
}

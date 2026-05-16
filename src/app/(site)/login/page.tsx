import { CredentialSignInForm } from "@/components/auth/CredentialSignInForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your SathiCollege student account."
});

export default function UserLoginPage() {
  return (
    <CredentialSignInForm
      mode="user"
      title="Sign In"
      subtitle="Student account access"
      defaultCallback="/"
    />
  );
}

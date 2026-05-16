import { CredentialSignInForm } from "@/components/auth/CredentialSignInForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign Up",
  description: "Create your SathiCollege student account.",
  path: "/signup",
  noIndex: true
});

export default function SignupPage() {
  return (
    <CredentialSignInForm
      mode="signup"
      title="Sign Up"
      subtitle="Create a student account"
      defaultCallback="/community"
    />
  );
}

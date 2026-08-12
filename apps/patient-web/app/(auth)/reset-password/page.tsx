import { Suspense } from "react";
import { Card, CardBody, SkeletonText } from "@doctor/ui";
import { AuthCard } from "../../_components/AuthCard";
import { ResetPasswordForm } from "../../_components/ResetPasswordForm";

export const metadata = {
  title: "Reset password",
  description: "Enter your reset code and choose a new password.",
};

function ResetResolver({ email }: { email: string }) {
  return <ResetPasswordForm initialEmail={email} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = typeof searchParams?.email === "string" ? searchParams.email : "";
  return (
    <AuthCard title="Set a new password" subtitle="Enter the code from your email and choose a new password.">
      <Suspense
        fallback={
          <Card padding="p-0"><CardBody><SkeletonText lines={4} /></CardBody></Card>
        }
      >
        <ResetResolver email={email} />
      </Suspense>
    </AuthCard>
  );
}

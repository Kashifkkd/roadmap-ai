import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Register - Kuiper",
  description: "Create your Kuiper account",
};

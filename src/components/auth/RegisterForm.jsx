"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { registerUser } from "@/api/register";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError("");

    try {
      validateForm();
      const result = await registerUser(formData);

      if (result.error) {
        const errorMessage =
          result.response?.message ||
          result.message ||
          "Registration failed. Please try again.";
        setValidationError(errorMessage);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.first_name ||
      !formData.last_name
    ) {
      throw new Error("Please fill in all required fields");
    }

    if (!formData.email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    if (formData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match");
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Registration Successful!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your account has been created successfully. Redirecting to login...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your information to get started
        </p>
      </div>

      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        className="space-y-2"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium">
              First Name *
            </Label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="John"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium">
              Last Name *
            </Label>
            <Input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password *
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 6 characters long
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password *
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium">
            Timezone
          </Label>
          <Input
            id="timezone"
            name="timezone"
            type="text"
            placeholder="UTC"
            value={formData.timezone}
            onChange={handleInputChange}
            className="w-full"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Auto-detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>

        {validationError && (
          <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md">
            {validationError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  );
}

export default RegisterForm;

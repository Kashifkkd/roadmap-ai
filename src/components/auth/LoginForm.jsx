"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/api/login";

export function LoginForm({ open = true, onOpenChange, buttonPosition }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ field: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email) return { field: "email", message: "Email is required" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return { field: "email", message: "Enter a valid email address" };

    if (!password)
      return { field: "password", message: "Password is required" };

    if (password.length < 6)
      return {
        field: "password",
        message: "Password must be at least 6 characters",
      };

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError({ field: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError({ field: "", message: "" });

    try {
      const result = await loginUser(formData);

      if (result.error) {
        throw new Error(
          result.response?.message || "Invalid email or password"
        );
      }

      const data = result.response;

      localStorage.setItem("user_name", data.full_name);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      // Store CloudFront cookies 
      const cloudfrontCookies = data.cloudfront_cookies;
      if (cloudfrontCookies) {
        localStorage.setItem(
          "CloudFront-Policy",
          cloudfrontCookies["CloudFront-Policy"]
        );
        localStorage.setItem(
          "CloudFront-Signature",
          cloudfrontCookies["CloudFront-Signature"]
        );
        localStorage.setItem(
          "CloudFront-Key-Pair-Id",
          cloudfrontCookies["CloudFront-Key-Pair-Id"]
        );
      }

      if (onOpenChange) onOpenChange(false);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-changed"));
      }

      // Check for redirect parameter, fallback to stored redirect, default to home
      const redirectPath = searchParams.get("redirect");
      let destination = "/";

      if (redirectPath) {
        destination = decodeURIComponent(redirectPath);
      } else if (typeof window !== "undefined") {
        const storedRedirect =
          window.sessionStorage.getItem("postLoginRedirect");
        if (storedRedirect) {
          destination = storedRedirect;
          window.sessionStorage.removeItem("postLoginRedirect");
        }
      }

      router.push(destination);
    } catch (err) {
      setError({ field: "api", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setFormData({ email: "", password: "" });
      setError({ field: "", message: "" });
      setIsLoading(false);
    }
  }, [open]);

  const customStyle = buttonPosition
    ? {
        position: "fixed",
        top: `${buttonPosition.top}px`,
        left: `${buttonPosition.left}px`,
        transform: "none",
        maxWidth: "350px",
        width: "90vw",
        margin: 0,
      }
    : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white rounded-lg border-0 shadow-xl p-8 [&>button]:hidden"
        overlayClassName="backdrop-blur-none"
        customPosition={!!buttonPosition}
        style={customStyle}
      >
        <DialogTitle className="sr-only">Login</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-black">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                name="email"
                type="text"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 h-11 rounded-lg border ${
                  error.field === "email" ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {error.field === "email" && (
              <p className="text-sm text-red-600">{error.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-black">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full pl-10 pr-12 h-11 rounded-lg border ${
                  error.field === "password"
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {error.field === "password" && (
              <p className="text-sm text-white">{error.message}</p>
            )}
          </div>

          {/* Global / API Error */}
          {error.field === "api" && (
            <div className="p-3 text-sm text-white border border-red-200 rounded-md bg-red-50">
              {error.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold h-11 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Log In"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                if (onOpenChange) onOpenChange(false);
                router.push("/register");
              }}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginForm;

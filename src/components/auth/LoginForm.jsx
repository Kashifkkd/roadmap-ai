"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/api/login";

export function LoginForm({ open = true, onOpenChange, buttonPosition }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await loginUser(formData);

      if (result.error) {
        throw new Error(
          result.response?.message ||
            "Login failed. Please check your credentials."
        );
      }

      const data = result.response;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      // Close dialog if controlled
      if (onOpenChange) {
        onOpenChange(false);
      }

      router.push("/");
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({ email: "", password: "" });
      setError("");
      setIsLoading(false);
    }
  }, [open]);

  // Calculate custom position if buttonPosition is provided
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-bold text-black">
              Username
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="Enter Username"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 h-11 rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold text-black">
              Password
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 h-11 rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  rememberMe ? "bg-primary" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={rememberMe}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
                    rememberMe ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <Label
                htmlFor="remember-me"
                className="text-sm text-black cursor-pointer select-none"
                onClick={() => setRememberMe(!rememberMe)}
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => {
                // Handle forgot password
                router.push("/forgot-password");
              }}
              className="text-sm  text-primary hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-white font-bold h-11 rounded-lg hover:bg-primary-700 disabled:opacity-50 shadow-none"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Log In"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
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

"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Camera, Eye, EyeOff, CircleX, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { getUser } from "@/api/User/getUser";
import { uploadProfile } from "@/api/User/uploadProfile";
import { updateProfile } from "@/api/User/updateProfile";
import { useRefreshData } from "@/hooks/useQueryData";

const defaultAvatar = "/profile.png";

export default function MyAccountDialog({ open, onOpenChange, user }) {
  const { refreshUser } = useRefreshData();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isPictureDeleted, setIsPictureDeleted] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const fetchUser = async () => {
      const response = await getUser();
      if (response.response) {
        setUserData(response.response);
      }
    };

    fetchUser();
  }, [open]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // First upload the file to get the URL
      const uploadResponse = await uploadProfile(file);
      if (uploadResponse.response) {
        const url = uploadResponse.response.image_url;
        if (url) {
          setImageUrl(url);
          setProfileUrl(url);
          setIsPictureDeleted(false);
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePicture = () => {
    setProfileUrl(null);
    setImageUrl(null);
    setIsPictureDeleted(true);
  };

  const validateCurrentPassword = (value) => {
    if (!value && (password || confirmPassword)) {
      setCurrentPasswordError(
        "Current password is required to change password"
      );
      return false;
    }
    setCurrentPasswordError("");
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError("");
      return true;
    }
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (value, passwordValue) => {
    if (!passwordValue) {
      setConfirmPasswordError("");
      return true;
    }
    if (!value) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }
    if (value !== passwordValue) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const handleCurrentPasswordChange = (event) => {
    const value = event.target.value;
    setCurrentPassword(value);
    setCurrentPasswordError(""); // Clear error when typing
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    validatePassword(value);

    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, value);
    }
    // Validate current password if new password is being set
    if (value && currentPassword) {
      validateCurrentPassword(currentPassword);
    }
  };

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value, password);
  };

  const updateProfileData = async (data) => {
    const payload = {
      email: data.email || userData?.email || "",
      first_name: data.first_name || firstName,
      last_name: data.last_name || lastName,
      image_url:
        data.image_url !== undefined
          ? data.image_url
          : imageUrl || profileUrl || "",
      timezone: data.timezone || userData?.timezone || "",
      ...(password && confirmPassword && password === confirmPassword
        ? {
            current_password: currentPassword,
            new_password: password,
            new_password_confirm: confirmPassword,
          }
        : {}),
    };

    const response = await updateProfile(payload);
    if (response.response) {
      setUserData(response.response);
      // Refresh user to update Header automatically
      refreshUser();
      return { success: true };
    } else if (response.error) {
      // Handle error from backend
      return { success: false, error: response.error };
    }
    return { success: false };
  };

  const handleSave = async () => {
    // Validate first name before saving
    if (!firstName || firstName.trim() === "") {
      setFirstNameError("First name is required");
      return; // Don't save if first name is empty
    }
    setFirstNameError("");

    // Validate passwords before saving
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmPassword,
      password
    );
    const isCurrentPasswordValid = validateCurrentPassword(currentPassword);

    // If passwords are provided, both must be valid
    if (password || confirmPassword) {
      if (
        !isPasswordValid ||
        !isConfirmPasswordValid ||
        !isCurrentPasswordValid
      ) {
        return;
      }
    }

    setIsLoading(true);
    try {
      console.log("imageUrl", imageUrl);
      const result = await updateProfileData({
        email: userData?.email || "",
        first_name: firstName,
        last_name: lastName,
        image_url: isPictureDeleted ? "" : imageUrl || "",
        timezone: userData?.timezone || "",
        new_password: password,
        new_password_confirm: confirmPassword,
      });

      if (result && result.success === false) {
        if (
          result.error &&
          (result.error.includes("password") ||
            result.error.includes("incorrect") ||
            result.error.includes("current"))
        ) {
          setCurrentPasswordError("Current password is incorrect");
        }
        return;
      }

      // Reset deletion flag after successful save
      if (isPictureDeleted) {
        setIsPictureDeleted(false);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      // Check if error is related to password
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message.toLowerCase();
        if (
          errorMessage.includes("password") ||
          errorMessage.includes("incorrect")
        ) {
          setCurrentPasswordError("Current password is incorrect");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const avatar = isPictureDeleted
    ? defaultAvatar
    : imageUrl || userData?.image_url || defaultAvatar;

  useEffect(() => {
    if (!open) return;
    if (userData) {
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
      if (userData.avatar || userData.profile_picture) {
        setProfileUrl(userData.avatar || userData.profile_picture);
      }
    }
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
    setCurrentPasswordError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setFirstNameError("");
    setIsLoading(false);
    setIsPictureDeleted(false);
    setImageUrl(null);
  }, [open, userData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[572px] max-h-[485px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="rounded-[32px] bg-white">
          <div className="rounded-[28px]  bg-white px-2 py-2 sm:px-4 sm:py-2">
            <DialogHeader className="py-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  My Account
                </DialogTitle>
                <CircleX
                  className="w-5 h-5 text-gray-600"
                  onClick={() => onOpenChange(false)}
                />
              </div>
            </DialogHeader>

            <div className=" p-2 bg-gray-100 rounded-2xl">
              <form
                onSubmit={(event) => event.preventDefault()}
                className="flex flex-col gap-6 md:flex-row bg-white rounded-t-2xl p-2"
              >
                <section className="flex flex-col  gap-4 rounded-2xl bg-[#F1F0FE] p-2 md:w-1/3">
                  <span className="text-sm font-medium text-center text-gray-900">
                    Profile Picture
                  </span>
                  <div className="relative flex h-38 w-38 items-center justify-center rounded-full bg-gray-100 ">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                      {isPictureDeleted ||
                      !(imageUrl || userData?.image_url) ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-semibold">
                          {firstName?.charAt(0)?.toUpperCase() ||
                            lastName?.charAt(0)?.toUpperCase() ||
                            "A".toUpperCase()}
                        </div>
                      ) : (
                        <img
                          src={imageUrl || userData?.image_url || defaultAvatar}
                          alt="Profile preview"
                          className="rounded-full h-full w-full object-cover"
                        />
                      )}
                    </div>
                    {/* <button
                      type="button"
                      onClick={handleChangeClick}
                      className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-white text-[#6B5AE0] shadow-lg transition"
                    >
                      <Camera className="size-5" />
                    </button> */}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-1 justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleChangeClick}
                      className=" border-primary-400 text-[#6B5AE0] hover:bg-[#6B5AE0]/10 py-4 px-6 cursor-pointer"
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDeletePicture}
                      className=" text-sm bg-gray-100 text-gray-500 hover:text-[#6B5AE0] cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </section>

                <section className="flex-1 space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="text-left">
                      <Label className="mb-1 text-sm text-gray-900">
                        First Name*
                      </Label>
                      <Input
                        value={firstName}
                        onChange={(event) => {
                          setFirstName(event.target.value);
                          setFirstNameError("");
                        }}
                        placeholder="Enter your first name"
                        required
                        className={firstNameError ? "border-red-500" : ""}
                      />
                      {firstNameError && (
                        <p className="text-xs text-red-500 mt-1">
                          {firstNameError}
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <Label className="mb-1 text-sm text-gray-900">
                        Last Name*
                      </Label>
                      <Input
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <Label className="text-sm text-gray-900">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={isCurrentPasswordVisible ? "text" : "password"}
                        value={currentPassword}
                        onChange={handleCurrentPasswordChange}
                        placeholder="Enter your current password"
                        className={`pr-12 ${
                          currentPasswordError ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-700"
                        onClick={() =>
                          setIsCurrentPasswordVisible((current) => !current)
                        }
                      >
                        {isCurrentPasswordVisible ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {currentPasswordError && (
                      <p className="text-xs text-red-500 mt-1">
                        {currentPasswordError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-left">
                    <Label className="text-sm text-gray-900">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Enter a new password"
                        className={`pr-12 ${
                          passwordError ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-700"
                        onClick={() =>
                          setIsPasswordVisible((current) => !current)
                        }
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-500 mt-1">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-left">
                    <Label className="text-sm text-gray-900">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={isConfirmVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="Re-enter password"
                        className={`pr-12 ${
                          confirmPasswordError ? "border-red-500" : ""
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-gray-700"
                        onClick={() =>
                          setIsConfirmVisible((current) => !current)
                        }
                      >
                        {isConfirmVisible ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-xs text-red-500 mt-1">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </section>
              </form>
              <div className="flex justify-end bg-white rounded-b-2xl p-2 mt-1">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="min-w-[120px] rounded-md bg-[#6B5AE0] px-6 py-2 text-base font-semibold shadow-lg shadow-[#6B5AE0]/30 hover:bg-[#5a48d1] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

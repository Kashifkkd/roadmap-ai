"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Camera, Eye, EyeOff, CircleX, Trash2 } from "lucide-react";
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

const defaultAvatar = "/profile.png";

export default function MyAccountDialog({ open, onOpenChange, user }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const [userData, setUserData] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
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
  };

  const updateProfileData = async (data) => {
    const payload = {
      email: data.email || userData?.email || "",
      first_name: data.first_name || firstName,
      last_name: data.last_name || lastName,
      image_url: data.image_url || imageUrl || profileUrl || "",
      timezone: data.timezone || userData?.timezone || "",
      ...(password && confirmPassword && password === confirmPassword
        ? {
            current_password: "",
            new_password: password,
            new_password_confirm: confirmPassword,
          }
        : {}),
    };

    const response = await updateProfile(payload);
    if (response.response) {
      setUserData(response.response);
      // Refresh user data
      const refreshResponse = await getUser();
      if (refreshResponse.response) {
        setUserData(refreshResponse.response);
      }
    }
  };

  const handleSave = async () => {
    console.log("imageUrl", imageUrl);
    const response = await updateProfileData({
      email: userData?.email || "",
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl || "",
      timezone: userData?.timezone || "",
    });
    onOpenChange(false);
  };

  const avatar = imageUrl || userData?.image_url || defaultAvatar;

  useEffect(() => {
    if (!open) return;
    if (userData) {
      setFirstName(userData.first_name || "");
      setLastName(userData.last_name || "");
      if (userData.avatar || userData.profile_picture) {
        setProfileUrl(userData.avatar || userData.profile_picture);
      }
    }
    setPassword("");
    setConfirmPassword("");
  }, [open, userData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[572px] max-h-[485px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="rounded-[32px] bg-white">
          <div className="rounded-[28px]  bg-white px-4 py-2 sm:px-4 sm:py-2">
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
                <section className="flex flex-col  gap-4 rounded-2xl bg-[#F1F0FE] p-4 md:w-1/3">
                  <span className="text-sm font-medium text-center text-gray-900">
                    Profile Picture
                  </span>
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 p-1">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                      {!(imageUrl || userData?.image_url) ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-semibold">
                          {avatar?.charAt(0)?.toUpperCase() ||
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
                    <button
                      type="button"
                      onClick={handleChangeClick}
                      className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-white text-[#6B5AE0] shadow-lg transition"
                    >
                      <Camera className="size-5" />
                    </button>
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
                      className=" border-[#D0C7FF] text-[#6B5AE0] hover:bg-white py-4"
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDeletePicture}
                      className=" text-sm bg-gray-100 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </section>

                <section className="flex-1 space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="text-left">
                      <Label className="mb-1 text-sm text-gray-600">
                        First Name*
                      </Label>
                      <Input
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="text-left">
                      <Label className="mb-1 text-sm text-gray-600">
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
                    <Label className="text-sm text-gray-600">Password*</Label>
                    <div className="relative">
                      <Input
                        type={isPasswordVisible ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter a new password"
                        className="pr-12"
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
                  </div>

                  <div className="space-y-1 text-left">
                    <Label className="text-sm text-gray-600">
                      Confirm Password*
                    </Label>
                    <div className="relative">
                      <Input
                        type={isConfirmVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter password"
                        className="pr-12"
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
                  </div>
                </section>
              </form>
              <div className="flex justify-end bg-white rounded-b-2xl p-2 mt-1">
                <Button
                  type="button"
                  onClick={handleSave}
                  className="min-w-[120px] rounded-md bg-[#6B5AE0] px-6 py-2 text-base font-semibold shadow-lg shadow-[#6B5AE0]/30 hover:bg-[#5a48d1]"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

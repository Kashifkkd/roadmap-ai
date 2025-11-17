"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Camera, Eye, EyeOff, ShieldCheck, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const defaultAvatar = "/profile.png";

export default function MyAccountDialog({ open, onOpenChange, user }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
  }, [open]);

  const avatar = user?.avatar || defaultAvatar;

  const initials =
    firstName?.charAt(0) + lastName?.charAt(0) || "A".toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[572px] max-h-[485px] border-0 bg-transparent p-0 shadow-none">
        <div className="rounded-[32px] bg-white">
          <div className="rounded-[28px]  bg-white px-4 py-2 sm:px-4 sm:py-2">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                My Account
              </DialogTitle>
            </DialogHeader>

            <div className=" p-2 bg-gray-100 rounded-2xl">
              <form
                onSubmit={(event) => event.preventDefault()}
                className="flex flex-col gap-6 md:flex-row bg-white rounded-2xl p-2"
              >
                <section className="flex flex-col  gap-4 rounded-2xl bg-[#F1F0FE] p-6 md:w-1/3">
                  <span className="text-sm font-medium text-center text-gray-900">
                    Profile Picture
                  </span>
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gray-100 p-1">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                      {avatar === defaultAvatar ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-semibold">
                          {initials}
                        </div>
                      ) : (
                        <img
                          src={avatar}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-white text-[#6B5AE0] shadow-lg transition"
                    >
                      <Camera className="size-5" />
                    </button>
                  </div>
                  <div className="flex flex-1 justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className=" border-[#D0C7FF] text-[#6B5AE0] hover:bg-white py-4"
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
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

                  {/* <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#F9F7FF] p-4 text-sm text-gray-500">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      Password requirements
                    </p>
                    <p>Use 8+ characters with numbers, letters & symbols.</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-full bg-white text-[#6B5AE0]">
                    <ShieldCheck className="size-5" />
                  </div>
                </div> */}

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="min-w-[120px] rounded-xl bg-[#6B5AE0] px-6 py-2 text-base font-semibold shadow-lg shadow-[#6B5AE0]/30 hover:bg-[#5a48d1]"
                    >
                      Save
                    </Button>
                  </div>
                </section>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

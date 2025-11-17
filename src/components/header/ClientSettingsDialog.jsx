"use client";

import React, { useState } from "react";
import { X, FileText, Users, MoreVertical, CircleX } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ClientSettingsDialog({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("general");
  const [clientName, setClientName] = useState("");
  const [website, setWebsite] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[908px] max-h-[90vh] border-0 bg-transparent p-0 shadow-none overflow-hidden [&>button]:hidden">
        <div className="rounded-[32px] bg-white overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-gray-900">
                Client Settings
              </h2>
              <button onClick={() => onOpenChange(false)}>
                <CircleX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden gap-2 min-h-0 bg-gray-100 p-2">
              {/* Left Sidebar */}
              <div className="w-[240px] rounded-lg border-gray-200 bg-gray-50 p-4 flex flex-col flex-shrink-0">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors mb-2 cursor-pointer ${
                    activeTab === "general"
                      ? "bg-primary-700 text-white"
                      : "text-gray-700 hover:bg-primary-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-base font-medium">General Info</span>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
                    activeTab === "users"
                      ? "bg-primary-700 text-white"
                      : "text-gray-700 hover:bg-primary-100"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-base font-medium">Users</span>
                </button>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 overflow-y-auto p-8 rounded-lg bg-white">
                {activeTab === "general" && (
                  <div className="space-y-6">
                    {/* Client Name and Website Row */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Client Name<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Website
                        </Label>
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Color Logo */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          Color Logo (Upload PNG)
                        </Label>
                        <div className="p-2 bg-gray-100 rounded-lg max-w-[322px] max-h-[128px]">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4  gap-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer">
                            <input
                              type="file"
                              className=" absolute inset-0 w-full h-full cursor-pointer"
                            />
                            <div className="text-gray-500 text-sm">
                              Upload PNG
                            </div>
                            <Button
                              type="button"
                              className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg"
                            >
                              + Browse
                            </Button>
                          </div>
                        </div>
                      </div>

                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                          White Logo (Upload PNG)
                        </Label>
                        <div className="p-2 bg-gray-100 rounded-lg max-w-[322px] max-h-[128px]">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4  gap-2 flex flex-col items-center justify-center bg-gray-50 cursor-pointer">
                            <input
                              type="file"
                              className=" absolute inset-0 w-full h-full cursor-pointer"
                            />
                            <div className="text-gray-500 text-sm">
                              Upload PNG
                            </div>
                            <Button
                              type="button"
                              className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-4 py-2 rounded-lg"
                            >
                              + Browse
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Brand Colors */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-4 block">
                        Brand Colors
                      </Label>
                      <div className="grid grid-cols-2  gap-4">
                        {/* Color Swatch 1 - Purple */}
                        <div className="flex gap-3 p-2 border w-full h-full border-gray-200 rounded-lg bg-white">
                          <div className="w-16 h-10 rounded-md bg-[#7367F0]"></div>
                          <div className="gap-1 flex flex-col">
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#7367F0</div>
                          </div>
                        </div>

                        {/* Color Swatch 2 - Teal */}
                        <div className="flex items-center gap-3 p-2 border max-h-[54px] border-gray-200 rounded-lg bg-white">
                          <div className="w-16 h-10 rounded-lg bg-[#41B3A2]"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#41B3A2</div>
                          </div>
                        </div>

                        {/* Color Swatch 3 - Pink */}
                        <div className="flex gap-3 p-2 border items-center max-h-[54px] border-gray-200 rounded-lg bg-white">
                          <div className="w-16 h-10 rounded-md bg-[#CF1662]"></div>
                          <div className="gap-1 flex flex-col">
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#CF1662</div>
                          </div>
                        </div>

                        {/* Color Swatch 4 - Yellow */}
                        <div className="flex items-center gap-3 p-2 max-h-[54px] border border-gray-200 rounded-lg bg-white">
                          <div className="w-16 h-10 rounded-md bg-[#FFDC2F]"></div>
                          <div className="gap-1 flex flex-col">
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#654845</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-white">
                          <div className="w-16 h-10 rounded-lg bg-[#00A885]"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#00A885</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 max-h-[54px] p-2 border border-gray-200 rounded-lg bg-white">
                          <div className="w-16 h-10 rounded-lg bg-[#006C55]"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">
                              Title
                            </div>
                            <div className="text-xs text-gray-500">#006C55</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "users" && (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#E8F4F3]">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              First Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Last Name
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Current Comet
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 11 }).map((_, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm text-gray-600">
                                First Name
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Last Name
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Email
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                Current Comet
                              </td>
                              <td className="px-4 py-3">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-8 py-4 border-t border-gray-200 flex-shrink-0">
              <Button
                type="button"
                className="bg-[#645AD1] hover:bg-[#574EB6] text-white px-6 py-2 rounded-lg font-medium"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

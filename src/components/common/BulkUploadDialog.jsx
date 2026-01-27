"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import * as XLSX from "xlsx";

const REQUIRED_FIELDS = [
    "first name",
    "last name",
    "email",
    "client id",
    "path id",
    "access level",
    "image url",
    "password",
    "timezone",
    "manager_email",
    "accountability_emails",
    "is_sso",
    "sso_provider",
    "cohort_id",
    "adhoc_paths",
    "remove_adhoc_paths",
    "foozi_reminder_enabled",
];

export default function BulkUploadDialog({ open, onClose, onUpload, isUploading }) {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    if (!open) return null;

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            onUpload(e);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDownloadTemplate = () => {
        // Column headers for the template
        const headers = [
            "first name",
            "last name",
            "email",
            "client id",
            "path id",
            "access level",
            "image url",
            "password",
            "timezone",
            "manager_email",
            "accountability_emails",
            "is_sso",
            "sso_provider",
            "cohort_id",
            "adhoc_paths",
            "remove_adhoc_paths",
            "foozi_reminder_enabled",
        ];

        // Create worksheet with headers only
        const ws = XLSX.utils.aoa_to_sheet([headers]);

        // Create workbook and add the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");

        // Generate and download the file
        XLSX.writeFile(wb, "bulk_upload_user_sheet.xlsx");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-[#D4EDEC] border-b">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#2B8A8A]" />
                        <h2 className="text-base font-semibold text-[#2B8A8A]">Bulk Upload Users</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-3">
                    {/* Instructions */}
                    <div className="space-y-1">
                        <p className="text-gray-700 text-sm">
                            Select an xlsx sheet below to start the bulk upload process.
                        </p>
                        <p className="text-gray-600 text-sm">
                            The column names in the xlsx sheet must match the following:
                        </p>
                    </div>

                    {/* Field Tags - compact layout for 2 rows */}
                    <div className="flex flex-wrap gap-1.5">
                        {REQUIRED_FIELDS.map((field) => (
                            <span
                                key={field}
                                className="px-2 py-0.5 text-xs bg-[#D4EDEC] text-[#2B8A8A] rounded border border-[#2B8A8A]/40"
                            >
                                {field}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 bg-[#E8F4F3] text-[#453E90] border border-[#453E90] hover:bg-[#d5ebe8] px-4 py-2 rounded-md font-medium"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            {isUploading ? "Uploading..." : "Choose an XLSX File"}
                        </Button>

                        <Button
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 bg-[#453E90] text-white hover:bg-[#574EB6] px-4 py-2 rounded-md font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Download Sample Template
                        </Button>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}

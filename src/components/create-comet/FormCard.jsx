import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";

export default function FormCard({ title, children, className }) {
  return (
    <Card
      variant="outline"
      className={`bg-background border-none shadow-none p-0 ${className || ""}`}
    >
      <CardHeader className="p-2 sm:p-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      {children}
    </Card>
  );
}

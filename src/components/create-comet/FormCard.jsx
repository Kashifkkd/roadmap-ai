import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";

export default function FormCard({ title, children, className, headerClassName }) {
  return (
    <Card
      variant="outline"
      className={`bg-background border-none shadow-none p-0 py-0 gap-0 ${className || ""}`}
    >
      <CardHeader className={`p-0 pb-2 ${headerClassName || ""}`}>
        <CardTitle className="text-base sm:text-lg font-semibold text-primary p-0">
          {title}
        </CardTitle>
      </CardHeader>
      {children}
    </Card>
  );
}

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Stars from "@/components/icons/Stars";

export default function OutlineMannerFooter() {
  const router = useRouter();

  const handleSubmit = () => {
    try {
      router?.push("/comet-manager");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleBackClick = () => {
    try {
      router?.push("/");
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  };

  return (
    <div className="border-t p-4 bg-background w-full rounded-b-xl">
      <div className="flex items-center justify-between">
        <Button className="bg-muted text-primary" onClick={handleBackClick}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        <Button
          variant="default"
          className="w-fit flex items-center justify-center gap-2 p-3 disabled:opacity-50"
          onClick={handleSubmit}
        >
          <Stars />
          <span>Create Comet</span>
        </Button>
      </div>
    </div>
  );
}

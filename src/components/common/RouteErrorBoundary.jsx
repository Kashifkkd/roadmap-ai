"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[${this.props.routeName ?? "page"}] render error:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            This page failed to load
          </h2>
          <p className="max-w-md text-sm text-gray-600">
            {this.state.error?.message ||
              "An unexpected error occurred while rendering this screen."}
          </p>
          <Button type="button" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

"use client";

import React from "react";

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-bg-card border border-border-main overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-bg-subtle" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-bg-subtle rounded" />
        <div className="h-4 w-3/4 bg-bg-subtle rounded" />
        <div className="h-3 w-1/2 bg-bg-subtle rounded" />
        <div className="pt-3 border-t border-border-subtle flex justify-between items-center">
          <div className="h-5 w-24 bg-bg-subtle rounded" />
          <div className="h-8 w-8 bg-bg-subtle rounded-full" />
        </div>
      </div>
    </div>
  );
}

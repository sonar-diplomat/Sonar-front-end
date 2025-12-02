import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export type TabId = 'home' | 'search' | 'library' | 'profile';
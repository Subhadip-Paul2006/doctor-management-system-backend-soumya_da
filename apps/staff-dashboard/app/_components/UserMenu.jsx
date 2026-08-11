"use client";

import { Dropdown, DropdownItem, Avatar } from "@doctor/ui";

// Placeholder user — real user switches in after Phase 08 auth.
export function UserMenu() {
  return (
    <Dropdown
      align="right"
      trigger={
        <span className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-navy-50">
          <Avatar name="Guest User" size="sm" />
          <span className="hidden text-sm font-medium text-navy-800 sm:inline">Guest</span>
        </span>
      }
    >
      <DropdownItem disabled title="Available after authentication">Profile (post-auth)</DropdownItem>
      <DropdownItem disabled title="Available after authentication">Settings (post-auth)</DropdownItem>
      <DropdownItem disabled title="Available after authentication">Log out (post-auth)</DropdownItem>
    </Dropdown>
  );
}

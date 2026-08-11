"use client";

import { useState } from "react";
import { Toast } from "@doctor/ui";

// UI entry point only — real notification feed arrives in a later phase.
export function NotificationButton() {
  const [ping, setPing] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setPing(true)}
        className="relative rounded-md p-2 text-navy-500 hover:bg-navy-100 hover:text-navy-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M15 17h5l-1.4-1.4c-.6-.6-1-1.4-1-2.3V9a5.6 5.6 0 00-4.5-5.5V3a1.1 1.1 0 00-2.2 0v.5A5.6 5.6 0 006.4 9v4.3c0 .9-.4 1.7-1 2.3L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-status-emergency-text" aria-hidden="true" />
      </button>
      {ping ? <Toast message="Notification feed arrives in a later phase." variant="info" onClose={() => setPing(false)} /> : null}
    </>
  );
}

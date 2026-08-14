"use client";

import { useState } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  Checkbox,
  Toast,
} from "@doctor/ui";

import { getPlatformSettingsData, PlatformSettingsData } from "../../_data/super-admin-data";

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettingsData>(getPlatformSettingsData());
  const [activeTab, setActiveTab] = useState<"general" | "booking" | "queue" | "notifications" | "security">("general");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Platform settings saved and applied successfully.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Platform Settings Console"
        description="Configure global multi-tenant system parameters, booking rules, queue defaults, notifications, and security policies."
      />

      {/* Settings Category Navigation Bar */}
      <Card>
        <CardBody className="p-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "general", label: "General Settings" },
              { id: "booking", label: "Booking Rules" },
              { id: "queue", label: "Queue Defaults" },
              { id: "notifications", label: "Notifications & Sockets" },
              { id: "security", label: "Security & Sessions" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-medical-600 text-white shadow-sm"
                    : "bg-navy-100 text-navy-700 hover:bg-navy-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Category 1: General Settings */}
        {activeTab === "general" && (
          <Card>
            <CardHeader
              title="1. General Platform Identification"
              subtitle="Brand name, support contact, timezone, and currency defaults"
            />
            <CardBody className="space-y-4">
              <Input
                label="Platform Brand Name *"
                value={settings.platformName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({ ...settings, platformName: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Official Support Email Address *"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  required
                />
                <Input
                  label="Emergency Support Hotline *"
                  value={settings.emergencyHotline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, emergencyHotline: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Default Platform Timezone"
                  value={settings.defaultTimezone}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSettings({ ...settings, defaultTimezone: e.target.value })
                  }
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </Select>

                <Select
                  label="Platform Currency Symbol"
                  value={settings.currency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                >
                  <option value="INR (INR)">INR (Indian Rupee)</option>
                  <option value="USD ($)">USD ($ US Dollar)</option>
                </Select>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Category 2: Booking Rules */}
        {activeTab === "booking" && (
          <Card>
            <CardHeader
              title="2. Appointment & Token Booking Rules"
              subtitle="Limits on advance token booking, cancellation windows, and daily caps"
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Advance Booking Window (Days) *"
                  type="number"
                  value={settings.advanceBookingDays.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, advanceBookingDays: parseInt(e.target.value) || 30 })
                  }
                  required
                />

                <Input
                  label="Cancellation Cut-Off Window (Hours) *"
                  type="number"
                  value={settings.cancellationWindowHours.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, cancellationWindowHours: parseInt(e.target.value) || 4 })
                  }
                  required
                />

                <Input
                  label="Max Daily Tokens Per Doctor *"
                  type="number"
                  value={settings.maxDailyTokensPerDoctor.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, maxDailyTokensPerDoctor: parseInt(e.target.value) || 100 })
                  }
                  required
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Category 3: Queue Defaults */}
        {activeTab === "queue" && (
          <Card>
            <CardHeader
              title="3. Chamber Queue & Consultation Defaults"
              subtitle="Default consultation timing and chamber auto-pause triggers"
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Default Consultation Duration (Mins) *"
                  type="number"
                  value={settings.defaultConsultationMinutes.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, defaultConsultationMinutes: parseInt(e.target.value) || 15 })
                  }
                  required
                />

                <Select
                  label="Default Chamber Queue Mode"
                  value={settings.defaultQueueMode}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSettings({ ...settings, defaultQueueMode: e.target.value })
                  }
                >
                  <option value="LIVE">LIVE Queue (Sequential Tokens)</option>
                  <option value="TIME_SLOT">TIME_SLOT (Fixed Clock Times)</option>
                  <option value="PRIVATE">PRIVATE (By Appointment Only)</option>
                </Select>

                <Input
                  label="Auto-Pause Inactivity Threshold (Mins) *"
                  type="number"
                  value={settings.autoPauseThresholdMinutes.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, autoPauseThresholdMinutes: parseInt(e.target.value) || 45 })
                  }
                  required
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Category 4: Notifications & Sockets */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader
              title="4. Realtime Notification & Socket Gateway"
              subtitle="Configure system-wide notifications, SMS dispatch, and live sound alerts"
            />
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <Checkbox
                  label="Enable Automatic Email Notifications for Appointment Updates"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, emailNotificationsEnabled: e.target.checked })
                  }
                />

                <Checkbox
                  label="Enable SMS Gateway for Token Confirmation & Walk-In Slips"
                  checked={settings.smsNotificationsEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, smsNotificationsEnabled: e.target.checked })
                  }
                />

                <Checkbox
                  label="Enable Live Socket Audio Chimes on Token Call"
                  checked={settings.liveSocketChimeEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, liveSocketChimeEnabled: e.target.checked })
                  }
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Category 5: Security & Sessions */}
        {activeTab === "security" && (
          <Card>
            <CardHeader
              title="5. Security & Authentication Policies"
              subtitle="Configure JWT token expiration windows and password complexity rules"
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="JWT Access Token Expiry (Minutes) *"
                  type="number"
                  value={settings.jwtAccessExpiryMinutes.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, jwtAccessExpiryMinutes: parseInt(e.target.value) || 15 })
                  }
                  required
                />

                <Input
                  label="JWT Refresh Cookie Expiry (Days) *"
                  type="number"
                  value={settings.jwtRefreshExpiryDays.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettings({ ...settings, jwtRefreshExpiryDays: parseInt(e.target.value) || 7 })
                  }
                  required
                />
              </div>

              <Checkbox
                label="Enforce Password Complexity Rules (Min 8 chars, numbers & special characters)"
                checked={settings.requirePasswordComplexity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({ ...settings, requirePasswordComplexity: e.target.checked })
                }
              />
            </CardBody>
          </Card>
        )}

        {/* Form Action Controls */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-navy-200 shadow-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSettings(getPlatformSettingsData());
              setToastMessage("Settings reset to platform defaults.");
            }}
          >
            Reset to Platform Defaults
          </Button>

          <Button type="submit">
            Save Platform Settings
          </Button>
        </div>
      </form>

      {/* Notification Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

/**
 * Shared Tailwind CSS v3 preset for the Doctor Management System frontend.
 * Design tokens per docs/DESIGN_SYSTEM.md (medical emerald + navy palette).
 * Consumed by apps/patient-web and apps/staff-dashboard via tailwind.config.ts.
 */
/** @type {import('tailwindcss').Config} */
const sharedTailwindConfig = {
  theme: {
    extend: {
      colors: {
        // Primary Medical Emerald Theme
        medical: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          500: "#10B981",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
        // Deep Navy / Slate Neutral Hierarchy
        navy: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          500: "#64748B",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        // Appointment/queue status colors (bg/text/border triplets)
        status: {
          waiting: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },    // Amber
          checkedIn: { bg: "#E0F2FE", text: "#075985", border: "#BAE6FD" },  // Sky Blue
          completed: { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" },  // Emerald
          cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },  // Rose Red
          absent: { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" },     // Slate Gray
          emergency: { bg: "#FFE4E6", text: "#9F1239", border: "#FECDD3" },  // Crimson
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        overlay: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};

module.exports = sharedTailwindConfig;

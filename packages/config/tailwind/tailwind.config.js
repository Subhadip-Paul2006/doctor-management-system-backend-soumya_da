/**
 * Shared Tailwind CSS v3 preset for the Doctor Management System frontend.
 * Design tokens per docs/DESIGN_SYSTEM.md (medical emerald + navy palette).
 * Consumed by apps/patient-web and apps/staff-dashboard via tailwind.config.js.
 */
/** @type {import('tailwindcss').Config} */
const sharedTailwindConfig = {
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};

module.exports = sharedTailwindConfig;

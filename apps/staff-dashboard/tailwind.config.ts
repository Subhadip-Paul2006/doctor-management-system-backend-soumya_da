import sharedConfig from "@doctor/config/tailwind/tailwind.config";
import type { Config } from "tailwindcss";

const config: Config = {
  ...sharedConfig,
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;

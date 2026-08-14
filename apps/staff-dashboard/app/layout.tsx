import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "./_components/AuthProvider";

export const metadata: Metadata = {
  title: "Staff & Management Dashboard",
  description: "Enterprise multi-role portal for Doctors, Receptionists, Clinics, and Platform Admins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

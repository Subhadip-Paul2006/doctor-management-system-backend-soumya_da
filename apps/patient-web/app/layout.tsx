import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "./_components/AuthProvider";

export const metadata: Metadata = {
  title: "Patient Portal & Clinic Search",
  description: "Book appointments and track live queue positions.",
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

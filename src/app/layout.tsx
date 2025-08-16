import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manage Mate",
  description: "Project Management Platform with Issue Tracking & QA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

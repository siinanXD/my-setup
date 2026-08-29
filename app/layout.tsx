import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "my-setup · Task Board",
  description: "A demo app used to validate the Cloud Agent development environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

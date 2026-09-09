import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COSMIC ATLAS",
  description: "Explore Everything We Know About the Universe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

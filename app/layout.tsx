import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "The Lean Group Logistics",
  description: "Send packages to any door step in the world",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

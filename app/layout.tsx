import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Marketplace",
  description: "Buy and sell items on your college campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

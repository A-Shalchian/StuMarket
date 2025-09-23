import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StuMarket - College Student Marketplace",
  description: "The simple, safe marketplace for college students to buy and sell locally",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
          <AuthProvider>
            {children}
          </AuthProvider>
      </body>
    </html>
  );
}

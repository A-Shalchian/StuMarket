import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";
import Navbar from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "StuMarket - College Student Marketplace",
  description: "The simple, safe marketplace for college students to buy and sell locally",
};

function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
        `,
      }}
    />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
      </body>
    </html>
  );
}

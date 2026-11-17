import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numirelics",
  description: "Preserving History. Connecting Collectors. Redefining Ownership.",
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const isAdminMode = process.env.NEXT_PUBLIC_APP_MODE === "admin";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          {isAdminMode ? (
            <main>
              <Suspense>{children}</Suspense>
            </main>
          ) : (
            <>
              <main className="mx-auto max-w-lg pb-20">
                <Suspense>{children}</Suspense>
              </main>
              <Suspense><BottomNav /></Suspense>
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}

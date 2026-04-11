import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Skedify — Your professional profile",
    template: "%s | Skedify",
  },
  description:
    "Create your professional profile in 5 minutes. One page. All your services. One link.",
  keywords: [
    "link in bio",
    "freelancer profile",
    "portfolio",
    "online business card",
    "professional profile",
    "booking",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skedify-io.vercel.app",
    siteName: "Skedify",
    title: "Skedify — Your professional profile",
    description:
      "Create your professional profile in 5 minutes. One page. All your services. One link.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skedify — Your professional profile",
    description:
      "Create your professional profile in 5 minutes. One page. All your services. One link.",
  },
  metadataBase: new URL("https://skedify-io.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-[#F9FAFB] dark:bg-[#0b0b0f]">
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}